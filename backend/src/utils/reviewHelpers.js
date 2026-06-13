const REVIEWABLE_ORDER_STATUSES = ['delivered', 'completed'];

async function hasDeliveredPurchase(prisma, userId, productId) {
  const orderItem = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        buyerId: userId,
        paymentStatus: 'paid',
        status: { in: REVIEWABLE_ORDER_STATUSES },
      },
    },
  });
  return Boolean(orderItem);
}

async function hasExistingReview(prisma, userId, productId) {
  const review = await prisma.review.findUnique({
    where: {
      productId_authorId: { productId, authorId: userId },
    },
  });
  return Boolean(review);
}

async function getReviewEligibility(prisma, userId, productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, sellerId: true },
  });

  if (!product) {
    return { canReview: false, hasReviewed: false, reason: 'not_found' };
  }

  if (product.sellerId === userId) {
    return { canReview: false, hasReviewed: false, reason: 'own_product' };
  }

  const hasReviewed = await hasExistingReview(prisma, userId, productId);
  if (hasReviewed) {
    return { canReview: false, hasReviewed: true, reason: 'already_reviewed' };
  }

  const purchased = await hasDeliveredPurchase(prisma, userId, productId);
  if (!purchased) {
    return { canReview: false, hasReviewed: false, reason: 'not_eligible' };
  }

  return { canReview: true, hasReviewed: false, reason: null };
}

async function assertCanReview(prisma, userId, productId) {
  const eligibility = await getReviewEligibility(prisma, userId, productId);

  if (eligibility.reason === 'not_found') {
    return { ok: false, status: 404, error: 'Product not found' };
  }
  if (eligibility.reason === 'own_product') {
    return { ok: false, status: 403, error: 'Penjual tidak dapat memberi ulasan pada produk sendiri' };
  }
  if (eligibility.hasReviewed) {
    return { ok: false, status: 400, error: 'Anda sudah memberi ulasan untuk produk ini' };
  }
  if (!eligibility.canReview) {
    return {
      ok: false,
      status: 403,
      error: 'Ulasan hanya bisa diberikan setelah pesanan diterima',
    };
  }

  return { ok: true };
}

module.exports = {
  REVIEWABLE_ORDER_STATUSES,
  hasDeliveredPurchase,
  hasExistingReview,
  getReviewEligibility,
  assertCanReview,
};
