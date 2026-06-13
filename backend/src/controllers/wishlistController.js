const prisma = require('../config/database');
const { formatProduct, computeSellerRatingsBatch, sellerPublicSelect } = require('../utils/productHelpers');

const productCardSelect = {
  id: true,
  title: true,
  author: true,
  price: true,
  images: true,
  category: true,
  condition: true,
  discountPercent: true,
  stock: true,
  sold: true,
  available: true,
  seller: { select: sellerPublicSelect },
};

async function formatWishlistProducts(items, prismaClient) {
  const ratingMap = await computeSellerRatingsBatch(
    prismaClient,
    items.map((item) => item.product.sellerId),
  );

  return items.map((item) => ({
    id: item.id,
    productId: item.productId,
    createdAt: item.createdAt,
    product: formatProduct(item.product, ratingMap.get(item.product.sellerId) ?? 0),
  }));
}

exports.getWishlist = async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      include: { product: { select: productCardSelect } },
    });

    const data = await formatWishlistProducts(items, prisma);

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};

exports.getWishlistIds = async (req, res, next) => {
  try {
    const items = await prisma.wishlistItem.findMany({
      where: { userId: req.user.id },
      select: { productId: true },
    });
    res.json({ success: true, data: items.map((i) => i.productId) });
  } catch (err) {
    next(err);
  }
};

exports.addToWishlist = async (req, res, next) => {
  try {
    const productId = parseInt(req.body.productId, 10);
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.available) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });
    if (existing) {
      return res.json({ success: true, data: existing, added: false });
    }

    const item = await prisma.wishlistItem.create({
      data: { userId: req.user.id, productId },
    });

    res.status(201).json({ success: true, data: item, added: true });
  } catch (err) {
    next(err);
  }
};

exports.removeFromWishlist = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);

    await prisma.wishlistItem.deleteMany({
      where: { userId: req.user.id, productId },
    });

    res.json({ success: true, message: 'Removed from wishlist' });
  } catch (err) {
    next(err);
  }
};

exports.toggleWishlist = async (req, res, next) => {
  try {
    const productId = parseInt(req.body.productId, 10);
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return res.json({ success: true, favorited: false });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || !product.available) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    await prisma.wishlistItem.create({
      data: { userId: req.user.id, productId },
    });

    res.json({ success: true, favorited: true });
  } catch (err) {
    next(err);
  }
};
