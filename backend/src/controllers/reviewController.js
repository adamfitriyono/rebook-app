const prisma = require('../config/database');

exports.getProductReviews = async (req, res, next) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: { author: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        author: r.author.fullName,
        createdAt: r.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
};

exports.createReview = async (req, res, next) => {
  try {
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Invalid review data' });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const review = await prisma.review.create({
      data: {
        productId,
        authorId: req.user.id,
        targetSellerId: product.sellerId,
        rating: parseInt(rating, 10),
        comment: comment || null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: review,
    });
  } catch (err) {
    if (err.code === 'P2002') {
      return res.status(400).json({ success: false, error: 'You already reviewed this product' });
    }
    next(err);
  }
};

exports.updateReview = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review || review.authorId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...(rating && { rating: parseInt(rating, 10) }),
        ...(comment !== undefined && { comment }),
      },
    });

    res.json({ success: true, message: 'Review updated', data: updated });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review || review.authorId !== req.user.id) {
      return res.status(404).json({ success: false, error: 'Review not found' });
    }

    await prisma.review.delete({ where: { id } });
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
