const prisma = require('../config/database');
const { computeSellerRating } = require('../utils/productHelpers');

const sellerCardSelect = {
  id: true,
  fullName: true,
  profileImage: true,
  city: true,
  province: true,
  sellerVerified: true,
  role: true,
};

async function formatFollowedSeller(follow) {
  const [totalProducts, totalSold, rating] = await Promise.all([
    prisma.product.count({ where: { sellerId: follow.sellerId } }),
    prisma.product.aggregate({
      where: { sellerId: follow.sellerId },
      _sum: { sold: true },
    }),
    computeSellerRating(prisma, follow.sellerId),
  ]);

  return {
    id: follow.id,
    sellerId: follow.sellerId,
    createdAt: follow.createdAt,
    seller: {
      ...follow.seller,
      verified: follow.seller.sellerVerified,
      rating,
      totalProducts,
      totalSold: totalSold._sum.sold || 0,
    },
  };
}

exports.getFollowedSellers = async (req, res, next) => {
  try {
    const follows = await prisma.sellerFollow.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { seller: { select: sellerCardSelect } },
    });

    const data = await Promise.all(follows.map(formatFollowedSeller));

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getFollowedSellerIds = async (req, res, next) => {
  try {
    const follows = await prisma.sellerFollow.findMany({
      where: { userId: req.user.id },
      select: { sellerId: true },
    });
    res.json({ success: true, data: follows.map((f) => f.sellerId) });
  } catch (err) {
    next(err);
  }
};

exports.toggleSellerFollow = async (req, res, next) => {
  try {
    const sellerId = parseInt(req.body.sellerId, 10);
    if (!sellerId) {
      return res.status(400).json({ success: false, error: 'sellerId is required' });
    }

    if (sellerId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Tidak bisa follow toko sendiri' });
    }

    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { id: true, role: true },
    });

    if (!seller || (seller.role !== 'seller' && seller.role !== 'admin')) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }

    const existing = await prisma.sellerFollow.findUnique({
      where: { userId_sellerId: { userId: req.user.id, sellerId } },
    });

    if (existing) {
      await prisma.sellerFollow.delete({ where: { id: existing.id } });
      return res.json({ success: true, following: false });
    }

    await prisma.sellerFollow.create({
      data: { userId: req.user.id, sellerId },
    });

    res.json({ success: true, following: true });
  } catch (err) {
    next(err);
  }
};
