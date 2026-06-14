const prisma = require('../config/database');
const { getProductLikeCount } = require('../utils/likeHelpers');

exports.getLikedIds = async (req, res, next) => {
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

exports.toggleLike = async (req, res, next) => {
  try {
    const productId = parseInt(req.body.productId, 10);
    if (!productId) {
      return res.status(400).json({ success: false, error: 'productId is required' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: req.user.id, productId } },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      const likeCount = await getProductLikeCount(prisma, productId);
      return res.json({ success: true, liked: false, likeCount });
    }

    await prisma.wishlistItem.create({
      data: { userId: req.user.id, productId },
    });

    const likeCount = await getProductLikeCount(prisma, productId);
    res.json({ success: true, liked: true, likeCount });
  } catch (err) {
    next(err);
  }
};
