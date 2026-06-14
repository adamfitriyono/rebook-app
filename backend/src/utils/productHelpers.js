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
  const map = await computeSellerRatingsBatch(prisma, [sellerId]);
  return map.get(sellerId) ?? 0;
}

async function computeSellerRatingsBatch(prismaClient, sellerIds) {
  const ids = [...new Set((sellerIds || []).filter((id) => id != null))];
  const map = new Map(ids.map((id) => [id, 0]));
  if (!ids.length) return map;

  const rows = await prismaClient.review.groupBy({
    by: ['targetSellerId'],
    where: { targetSellerId: { in: ids } },
    _avg: { rating: true },
  });

  rows.forEach((row) => {
    if (row.targetSellerId != null && row._avg.rating != null) {
      map.set(row.targetSellerId, Math.round(row._avg.rating * 10) / 10);
    }
  });

  return map;
}

function formatProductsWithSellerRatings(products, ratingMap) {
  return products.map((p) => formatProduct(p, ratingMap.get(p.sellerId) ?? 0));
}

const sellerPublicSelect = {
  id: true,
  fullName: true,
  profileImage: true,
  city: true,
  sellerVerified: true,
};

function formatSeller(seller, sellerRating = 0) {
  if (!seller) return undefined;
  return {
    id: seller.id,
    fullName: seller.fullName,
    profileImage: seller.profileImage || null,
    city: seller.city || null,
    rating: sellerRating,
    verified: Boolean(seller.sellerVerified),
  };
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
    weightGram: product.weightGram ?? null,
    lengthCm: product.lengthCm != null ? Number(product.lengthCm) : null,
    widthCm: product.widthCm != null ? Number(product.widthCm) : null,
    heightCm: product.heightCm != null ? Number(product.heightCm) : null,
    rating,
    reviewCount,
    seller: formatSeller(product.seller, sellerRating),
    stock: product.stock,
    sold: product.sold,
    viewCount: product.viewCount ?? 0,
    available: product.available,
    discountPercent: product.discountPercent || null,
    likeCount: product.likeCount ?? 0,
    createdAt: product.createdAt,
  };
}

function parseDiscountPercent(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0 || n > 99) return undefined;
  return n === 0 ? null : n;
}

function parseOptionalInt(value, { max } = {}) {
  if (value === undefined || value === null || value === '') return null;
  const n = parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) return undefined;
  if (max !== undefined && n > max) return undefined;
  return n;
}

function parseOptionalDecimal(value) {
  if (value === undefined || value === null || value === '') return null;
  const n = parseFloat(value);
  if (Number.isNaN(n) || n < 0) return undefined;
  return Math.round(n * 10) / 10;
}

function parseShippingSpecs(body) {
  const weightGram = parseOptionalInt(body.weightGram, { max: 50000 });
  if (weightGram === undefined) {
    return { error: 'Berat paket harus angka 0–50000 gram' };
  }

  const lengthCm = parseOptionalDecimal(body.lengthCm);
  if (lengthCm === undefined) return { error: 'Panjang paket tidak valid' };
  const widthCm = parseOptionalDecimal(body.widthCm);
  if (widthCm === undefined) return { error: 'Lebar paket tidak valid' };
  const heightCm = parseOptionalDecimal(body.heightCm);
  if (heightCm === undefined) return { error: 'Tinggi paket tidak valid' };

  return { data: { weightGram, lengthCm, widthCm, heightCm } };
}

module.exports = {
  computeProductRating,
  computeSellerRating,
  computeSellerRatingsBatch,
  formatProductsWithSellerRatings,
  formatProduct,
  formatSeller,
  sellerPublicSelect,
  parseDiscountPercent,
  parseOptionalInt,
  parseOptionalDecimal,
  parseShippingSpecs,
};
