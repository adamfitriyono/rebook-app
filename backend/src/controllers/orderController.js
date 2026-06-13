const prisma = require('../config/database');
const { buildOrderBreakdown } = require('../utils/orderFees');

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
              product: { select: { id: true, title: true, price: true, images: true } },
            },
          },
          transaction: true,
        },
      }),
      prisma.order.count({ where }),
    ]);

    const data = orders.map((o) => ({
      id: o.id,
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

exports.getOrderById = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: { select: { id: true, title: true, price: true, images: true, sellerId: true } },
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
        items: order.items.map((i) => ({
          product: {
            id: i.product.id,
            title: i.product.title,
            price: Number(i.product.price),
            images: i.product.images,
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
        buyer: isBuyer || isAdmin ? order.buyer : undefined,
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

    let subtotal = 0;
    let itemCount = 0;
    const orderItems = itemsToOrder.map((item) => {
      const priceAtTime = Number(item.product.price);
      subtotal += priceAtTime * item.quantity;
      itemCount += item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime,
      };
    });

    const breakdown = buildOrderBreakdown(subtotal, itemCount);
    const checkoutItemIds = itemsToOrder.map((item) => item.id);

    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          buyerId: req.user.id,
          totalPrice: breakdown.totalPrice,
          shippingAddress,
          shippingCity,
          shippingProvince,
          items: { create: orderItems },
        },
        include: { items: { include: { product: true } } },
      });

      await tx.cartItem.deleteMany({
        where: { id: { in: checkoutItemIds }, cartId: cart.id },
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        id: order.id,
        items: order.items.map((i) => ({
          product: { id: i.product.id, title: i.product.title, price: Number(i.product.price) },
          quantity: i.quantity,
          priceAtTime: Number(i.priceAtTime),
        })),
        totalPrice: Number(order.totalPrice),
        subtotal: breakdown.subtotal,
        serviceFee: breakdown.serviceFee,
        shippingFee: breakdown.shippingFee,
        itemCount: breakdown.itemCount,
        status: order.status,
        paymentStatus: order.paymentStatus,
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
      if (status !== 'shipped' || order.status !== 'paid') {
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

    const updated = await prisma.order.update({
      where: { id },
      data: { status: 'delivered' },
    });

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
          include: {
            buyer: { select: { fullName: true, phoneNumber: true } },
            transaction: true,
          },
        },
        product: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: orderItems });
  } catch (err) {
    next(err);
  }
};
