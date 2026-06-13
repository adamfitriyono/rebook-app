const prisma = require('../config/database');
const { computeSellerRating, formatProduct, formatProductsWithSellerRatings, computeSellerRatingsBatch, sellerPublicSelect } = require('../utils/productHelpers');
const { countSuccessfulSales, VERIFIED_SALES_THRESHOLD } = require('../utils/sellerVerification');

exports.getSellerProfile = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const seller = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        fullName: true,
        profileImage: true,
        city: true,
        province: true,
        role: true,
        sellerVerified: true,
        sellerVerifiedAt: true,
        sellerVerifiedBy: true,
      },
    });

    if (!seller || (seller.role !== 'seller' && seller.role !== 'admin')) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }

    const [totalProducts, totalSold, rating, successfulSales] = await Promise.all([
      prisma.product.count({ where: { sellerId: id } }),
      prisma.product.aggregate({
        where: { sellerId: id },
        _sum: { sold: true },
      }),
      computeSellerRating(prisma, id),
      countSuccessfulSales(prisma, id),
    ]);

    res.json({
      success: true,
      data: {
        ...seller,
        verified: seller.sellerVerified,
        rating,
        totalProducts,
        totalSold: totalSold._sum.sold || 0,
        successfulSales,
        verifiedSalesRequired: VERIFIED_SALES_THRESHOLD,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getSellerProducts = async (req, res, next) => {
  try {
    const sellerId = parseInt(req.params.id, 10);
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const skip = (page - 1) * limit;
    const { status = 'all' } = req.query;

    const seller = await prisma.user.findUnique({
      where: { id: sellerId },
      select: { id: true, role: true },
    });
    if (!seller || (seller.role !== 'seller' && seller.role !== 'admin')) {
      return res.status(404).json({ success: false, error: 'Toko tidak ditemukan' });
    }

    const where = { sellerId };
    if (status === 'available') {
      where.available = true;
      where.stock = { gt: 0 };
    } else if (status === 'sold_out') {
      where.stock = 0;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: sellerPublicSelect },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    const ratingMap = await computeSellerRatingsBatch(prisma, products.map((p) => p.sellerId));
    const data = formatProductsWithSellerRatings(products, ratingMap);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};
