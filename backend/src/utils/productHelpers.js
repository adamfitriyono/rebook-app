function computeProductRating(reviews) {
  if (!reviews || reviews.length === 0) {
    return { rating: 0, reviewCount: 0 };
  }
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return {
    rating: Math.round((sum / reviews.length) * 10) / 10,
    reviewCount: reviews.length,
  };
}

async function computeSellerRating(prisma, sellerId) {
  const reviews = await prisma.review.findMany({
    where: { targetSellerId: sellerId },
  });
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

function formatProduct(product, sellerRating = 0) {
  const { rating, reviewCount } = computeProductRating(product.reviews || []);
  return {
    id: product.id,
    title: product.title,
    author: product.author,
    description: product.description,
    condition: product.condition,
    price: Number(product.price),
    category: product.category,
    images: product.images,
    isbn: product.isbn,
    rating,
    reviewCount,
    seller: product.seller
      ? {
          id: product.seller.id,
          fullName: product.seller.fullName,
          profileImage: product.seller.profileImage || null,
          city: product.seller.city || null,
          rating: sellerRating,
        }
      : undefined,
    stock: product.stock,
    sold: product.sold,
    available: product.available,
    discountPercent: product.discountPercent || null,
    createdAt: product.createdAt,
  };
}

function parseDiscountPercent(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0 || n > 99) return undefined;
  return n === 0 ? null : n;
}

module.exports = { computeProductRating, computeSellerRating, formatProduct, parseDiscountPercent };
