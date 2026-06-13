const prisma = require('../config/database');

async function buildSellerStats(sellerId) {
  const products = await prisma.product.findMany({
    where: { sellerId },
    select: { sold: true, stock: true, viewCount: true },
  });

  const paidItems = await prisma.orderItem.findMany({
    where: {
      product: { sellerId },
      order: { paymentStatus: 'paid' },
    },
    select: {
      priceAtTime: true,
      quantity: true,
      order: { select: { id: true, status: true, createdAt: true } },
    },
  });

  const totalRevenue = paidItems.reduce(
    (sum, item) => sum + Number(item.priceAtTime) * item.quantity,
    0
  );

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const monthlyRevenue = paidItems
    .filter((item) => item.order.createdAt >= startOfMonth)
    .reduce((sum, item) => sum + Number(item.priceAtTime) * item.quantity, 0);

  const pendingOrderIds = new Set(
    paidItems
      .filter((item) => item.order.status === 'paid')
      .map((item) => item.order.id)
  );

  return {
    totalListings: products.length,
    totalSold: products.reduce((sum, p) => sum + p.sold, 0),
    activeListings: products.filter((p) => p.stock > 0).length,
    totalViews: products.reduce((sum, p) => sum + p.viewCount, 0),
    totalRevenue,
    monthlyRevenue,
    pendingOrders: pendingOrderIds.size,
    paidOrderCount: new Set(paidItems.map((i) => i.order.id)).size,
  };
}

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [orderCount, cart, listings] = await Promise.all([
      prisma.order.count({ where: { buyerId: userId } }),
      prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      }),
      req.user.role === 'seller' || req.user.role === 'admin'
        ? prisma.product.count({ where: { sellerId: userId } })
        : Promise.resolve(0),
    ]);

    const cartItemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) || 0;

    let sellerStats = null;
    if (req.user.role === 'seller' || req.user.role === 'admin') {
      sellerStats = await buildSellerStats(userId);
    }

    res.json({
      success: true,
      data: {
        orderCount,
        cartItemCount,
        listings,
        sellerStats,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSellerAnalytics = async (req, res, next) => {
  try {
    if (req.user.role !== 'seller' && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Akses ditolak' });
    }

    const sellerId = req.user.id;
    const [summary, products, paidItems] = await Promise.all([
      buildSellerStats(sellerId),
      prisma.product.findMany({
        where: { sellerId },
        select: {
          id: true,
          title: true,
          images: true,
          viewCount: true,
          sold: true,
          stock: true,
          price: true,
        },
        orderBy: { viewCount: 'desc' },
      }),
      prisma.orderItem.findMany({
        where: {
          product: { sellerId },
          order: { paymentStatus: 'paid' },
        },
        select: {
          productId: true,
          priceAtTime: true,
          quantity: true,
        },
      }),
    ]);

    const revenueByProduct = {};
    paidItems.forEach((item) => {
      revenueByProduct[item.productId] =
        (revenueByProduct[item.productId] || 0) + Number(item.priceAtTime) * item.quantity;
    });

    const productStats = products.map((p) => ({
      id: p.id,
      title: p.title,
      images: p.images,
      viewCount: p.viewCount,
      sold: p.sold,
      stock: p.stock,
      price: Number(p.price),
      revenue: revenueByProduct[p.id] || 0,
    }));

    res.json({
      success: true,
      data: {
        summary,
        products: productStats,
      },
    });
  } catch (err) {
    next(err);
  }
};
