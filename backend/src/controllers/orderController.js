const prisma = require('../config/database');
const {
  groupCartItemsBySeller,
  formatOrderItems,
  buildSellerOrderPayload,
  generateCheckoutGroupId,
} = require('../utils/orderHelpers');
const { verifySellersForDeliveredOrder } = require('../utils/sellerVerification');

function mapOrderSummary(order, breakdown, seller) {
  return {
    id: order.id,
    seller,
    items: formatOrderItems(order.items),
    totalPrice: Number(order.totalPrice),
    subtotal: breakdown.subtotal,
    serviceFee: breakdown.serviceFee,
    shippingFee: breakdown.shippingFee,
    itemCount: breakdown.itemCount,
    status: order.status,
    paymentStatus: order.paymentStatus,
    checkoutGroupId: order.checkoutGroupId,
    createdAt: order.createdAt,
  };
}

exports.getOrders = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const { status = 'all' } = req.query;

    const where = { buyerId: req.user.id };
    if (status !== 'all') where.status = status;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  title: true,
                  price: true,
                  images: true,
                  sellerId: true,
                  seller: { select: { id: true, fullName: true } },
                },
              },
            },
          },
          transaction: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    const data = orders.map((o) => ({
      id: o.id,
      checkoutGroupId: o.checkoutGroupId,
      seller: o.items[0]?.product?.seller
        ? { id: o.items[0].product.seller.id, fullName: o.items[0].product.seller.fullName }
        : null,
      items: o.items.map((i) => ({
        product: {
          id: i.product.id,
          title: i.product.title,
          price: Number(i.product.price),
          images: i.product.images,
        },
        quantity: i.quantity,
        priceAtTime: Number(i.priceAtTime),
      })),
      totalPrice: Number(o.totalPrice),
      status: o.status,
      paymentStatus: o.paymentStatus,
      shippingAddress: o.shippingAddress,
      shippingCity: o.shippingCity,
      shippingProvince: o.shippingProvince,
      trackingNumber: o.trackingNumber,
      createdAt: o.createdAt,
      transaction: o.transaction
        ? {
            id: o.transaction.id,
            transactionId: o.transaction.transactionId,
            status: o.transaction.status,
          }
        : null,
    }));

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrdersByGroup = async (req, res, next) => {
  try {
    const { checkoutGroupId } = req.params;

    const orders = await prisma.order.findMany({
      where: { checkoutGroupId, buyerId: req.user.id },
      orderBy: { id: 'asc' },
      include: {
        items: { include: { product: true } },
        transaction: true,
      },
    });

    if (!orders.length) {
      return res.status(404).json({ success: false, error: 'Checkout group not found' });
    }

    const sellers = await prisma.user.findMany({
      where: { id: { in: [...new Set(orders.flatMap((o) => o.items.map((i) => i.product.sellerId)))] } },
      select: { id: true, fullName: true },
    });
    const sellerMap = new Map(sellers.map((s) => [s.id, s]));

    const mapped = orders.map((order) => {
      const sellerId = order.items[0]?.product?.sellerId;
      const seller = sellerMap.get(sellerId) || null;
      return {
        id: order.id,
        seller,
        items: formatOrderItems(order.items),
        totalPrice: Number(order.totalPrice),
        status: order.status,
        paymentStatus: order.paymentStatus,
        transaction: order.transaction
          ? {
              paymentMethod: order.transaction.paymentMethod,
              transactionId: order.transaction.transactionId,
            }
          : null,
        createdAt: order.createdAt,
      };
    });

    const grandTotal = mapped.reduce((sum, o) => sum + o.totalPrice, 0);

    res.json({
      success: true,
      data: {
        checkoutGroupId,
        grandTotal,
        orders: mapped,
        paymentStatus: orders.every((o) => o.paymentStatus === 'paid') ? 'paid' : 'unpaid',
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                title: true,
                price: true,
                images: true,
                sellerId: true,
                weightGram: true,
                lengthCm: true,
                widthCm: true,
                heightCm: true,
              },
            },
          },
        },
        transaction: true,
        buyer: { select: { id: true, fullName: true, phoneNumber: true } },
      },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    const isBuyer = order.buyerId === req.user.id;
    const isAdmin = req.user.role === 'admin';
    const isSeller = order.items.some((i) => i.product.sellerId === req.user.id);

    if (!isBuyer && !isAdmin && !isSeller) {
      return res.status(403).json({ success: false, error: 'Forbidden' });
    }

    res.json({
      success: true,
      data: {
        id: order.id,
        checkoutGroupId: order.checkoutGroupId,
        items: order.items.map((i) => ({
          product: {
            id: i.product.id,
            title: i.product.title,
            price: Number(i.product.price),
            images: i.product.images,
            weightGram: i.product.weightGram,
            lengthCm: i.product.lengthCm != null ? Number(i.product.lengthCm) : null,
            widthCm: i.product.widthCm != null ? Number(i.product.widthCm) : null,
            heightCm: i.product.heightCm != null ? Number(i.product.heightCm) : null,
          },
          quantity: i.quantity,
          priceAtTime: Number(i.priceAtTime),
        })),
        totalPrice: Number(order.totalPrice),
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingAddress: order.shippingAddress,
        shippingCity: order.shippingCity,
        shippingProvince: order.shippingProvince,
        trackingNumber: order.trackingNumber,
        buyer: isBuyer || isAdmin || isSeller
          ? { id: order.buyer.id, fullName: order.buyer.fullName, phoneNumber: order.buyer.phoneNumber }
          : undefined,
        transaction: order.transaction
          ? {
              id: order.transaction.id,
              transactionId: order.transaction.transactionId,
              amount: Number(order.transaction.amount),
              paymentMethod: order.transaction.paymentMethod,
              status: order.transaction.status,
            }
          : null,
        createdAt: order.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.createOrder = async (req, res, next) => {
  try {
    const { shippingAddress, shippingCity, shippingProvince, cartItemIds } = req.body;

    if (!shippingAddress || !shippingCity || !shippingProvince) {
      return res.status(400).json({ success: false, error: 'Shipping information is required' });
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, error: 'Cart is empty' });
    }

    let itemsToOrder = cart.items.filter((item) => item.selected);

    if (Array.isArray(cartItemIds) && cartItemIds.length > 0) {
      const ids = new Set(cartItemIds.map((id) => parseInt(id, 10)).filter((id) => !Number.isNaN(id)));
      itemsToOrder = cart.items.filter((item) => ids.has(item.id) && item.selected);
    }

    if (itemsToOrder.length === 0) {
      return res.status(400).json({ success: false, error: 'Pilih minimal satu produk untuk checkout' });
    }

    for (const item of itemsToOrder) {
      const product = item.product;
      if (product.sellerId === req.user.id) {
        return res.status(400).json({
          success: false,
          error: `Tidak bisa membeli produk milik sendiri ("${product.title}")`,
        });
      }
      if (!product.available) {
        return res.status(400).json({
          success: false,
          error: `Produk "${product.title}" tidak tersedia`,
        });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Stok "${product.title}" tidak mencukupi (tersisa ${product.stock})`,
        });
      }
    }

    const staleThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await prisma.order.updateMany({
      where: {
        buyerId: req.user.id,
        status: 'pending',
        paymentStatus: 'unpaid',
        createdAt: { lt: staleThreshold },
      },
      data: { status: 'cancelled' },
    });

    const checkoutGroupId = generateCheckoutGroupId();
    const sellerGroups = groupCartItemsBySeller(itemsToOrder);

    const sellerPayloads = await Promise.all(
      sellerGroups.map((group) => buildSellerOrderPayload(group)),
    );

    const sellerIds = sellerPayloads.map((p) => p.sellerId);
    const sellers = await prisma.user.findMany({
      where: { id: { in: sellerIds } },
      select: { id: true, fullName: true },
    });
    const sellerMap = new Map(sellers.map((s) => [s.id, s]));

    const createdOrders = await prisma.$transaction(async (tx) => {
      const orders = [];

      for (const payload of sellerPayloads) {
        const order = await tx.order.create({
          data: {
            buyerId: req.user.id,
            checkoutGroupId,
            totalPrice: payload.breakdown.totalPrice,
            shippingAddress,
            shippingCity,
            shippingProvince,
            items: { create: payload.items },
          },
          include: { items: { include: { product: true } } },
        });
        orders.push({ order, breakdown: payload.breakdown, sellerId: payload.sellerId });
      }

      return orders;
    });

    const orders = createdOrders.map(({ order, breakdown, sellerId }) =>
      mapOrderSummary(order, breakdown, sellerMap.get(sellerId) || null),
    );

    const grandTotal = orders.reduce((sum, o) => sum + o.totalPrice, 0);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        checkoutGroupId,
        grandTotal,
        orders,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { status, trackingNumber } = req.body;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (req.user.role === 'seller') {
      const ownsItem = order.items.some((i) => i.product.sellerId === req.user.id);
      if (!ownsItem) {
        return res.status(403).json({ success: false, error: 'Forbidden' });
      }
      if (status !== 'shipped' || order.status !== 'paid' || order.paymentStatus !== 'paid') {
        return res.status(400).json({
          success: false,
          error: 'Seller can only mark paid orders as shipped',
        });
      }
      if (!trackingNumber || !String(trackingNumber).trim()) {
        return res.status(400).json({
          success: false,
          error: 'Tracking number is required when marking order as shipped',
        });
      }
    }

    const updateData = { status };
    if (trackingNumber !== undefined) {
      updateData.trackingNumber = String(trackingNumber).trim() || null;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    });

    res.json({
      success: true,
      message: 'Order status updated',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
};

exports.confirmOrder = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.buyerId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.status !== 'shipped') {
      return res.status(400).json({
        success: false,
        error: 'Order can only be confirmed when status is shipped',
      });
    }

    if (order.paymentStatus !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Order must be paid before confirming delivery',
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'completed' },
    });

    await verifySellersForDeliveredOrder(prisma, id);

    res.json({
      success: true,
      message: 'Order confirmed as received',
      data: { id: updated.id, status: updated.status },
    });
  } catch (err) {
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await prisma.order.findUnique({ where: { id } });

    if (!order || order.buyerId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }

    if (order.status !== 'pending' || order.paymentStatus !== 'unpaid') {
      return res.status(400).json({
        success: false,
        error: 'Only unpaid pending orders can be cancelled',
      });
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { id: updated.id, status: updated.status },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSellerOrders = async (req, res, next) => {
  try {
    const sellerProducts = await prisma.product.findMany({
      where: { sellerId: req.user.id },
      select: { id: true },
    });
    const productIds = sellerProducts.map((p) => p.id);

    const orderItems = await prisma.orderItem.findMany({
      where: { productId: { in: productIds } },
      include: {
        order: {
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            trackingNumber: true,
            createdAt: true,
            shippingAddress: true,
            shippingCity: true,
            shippingProvince: true,
            buyer: { select: { fullName: true, phoneNumber: true } },
          },
        },
        product: {
          select: {
            id: true,
            title: true,
            images: true,
            weightGram: true,
            lengthCm: true,
            widthCm: true,
            heightCm: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = orderItems.map((item) => ({
      id: item.id,
      quantity: item.quantity,
      product: {
        id: item.product.id,
        title: item.product.title,
        images: item.product.images,
        weightGram: item.product.weightGram,
        lengthCm: item.product.lengthCm != null ? Number(item.product.lengthCm) : null,
        widthCm: item.product.widthCm != null ? Number(item.product.widthCm) : null,
        heightCm: item.product.heightCm != null ? Number(item.product.heightCm) : null,
      },
      order: item.order,
    }));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
