const prisma = require('../config/database');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [orderCount, cart, listings] = await Promise.all([
      prisma.order.count({ where: { buyerId: userId } }),
      prisma.cart.findUnique({
        where: { userId },
        include: { items: true },
      }),
      req.user.role === 'seller'
        ? prisma.product.count({ where: { sellerId: userId } })
        : Promise.resolve(0),
    ]);

    const cartItemCount = cart?.items.reduce((sum, i) => sum + i.quantity, 0) || 0;

    let sellerStats = null;
    if (req.user.role === 'seller') {
      const products = await prisma.product.findMany({
        where: { sellerId: userId },
        select: { sold: true, stock: true },
      });
      sellerStats = {
        totalListings: products.length,
        totalSold: products.reduce((sum, p) => sum + p.sold, 0),
        activeListings: products.filter((p) => p.stock > 0).length,
      };
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
