async function getLikeCounts(prismaClient, productIds) {
  const ids = [...new Set((productIds || []).filter((id) => id != null))];
  const map = new Map(ids.map((id) => [id, 0]));
  if (!ids.length) return map;

  const rows = await prismaClient.wishlistItem.groupBy({
    by: ['productId'],
    where: { productId: { in: ids } },
    _count: { productId: true },
  });

  rows.forEach((row) => {
    map.set(row.productId, row._count.productId);
  });

  return map;
}

async function getLikedProductIdSet(prismaClient, userId, productIds) {
  if (!userId || !productIds?.length) return new Set();

  const ids = [...new Set(productIds.filter((id) => id != null))];
  const rows = await prismaClient.wishlistItem.findMany({
    where: { userId, productId: { in: ids } },
    select: { productId: true },
  });

  return new Set(rows.map((row) => row.productId));
}

async function getProductLikeCount(prismaClient, productId) {
  return prismaClient.wishlistItem.count({ where: { productId } });
}

function attachLikeCounts(products, likeCountMap) {
  return products.map((product) => ({
    ...product,
    likeCount: likeCountMap.get(product.id) ?? 0,
  }));
}

function attachLikedByMe(products, likedIds) {
  if (!likedIds) return products;
  return products.map((product) => ({
    ...product,
    likedByMe: likedIds.has(product.id),
  }));
}

module.exports = {
  getLikeCounts,
  getLikedProductIdSet,
  getProductLikeCount,
  attachLikeCounts,
  attachLikedByMe,
};
