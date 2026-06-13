const VERIFIED_SALES_THRESHOLD = 10;

async function countSuccessfulSales(prismaClient, sellerId) {
  return prismaClient.order.count({
    where: {
      status: 'delivered',
      items: {
        some: {
          product: { sellerId },
        },
      },
    },
  });
}

async function maybeAutoVerifySeller(prismaClient, sellerId) {
  const seller = await prismaClient.user.findUnique({
    where: { id: sellerId },
    select: { id: true, role: true, sellerVerified: true },
  });

  if (!seller || seller.sellerVerified) return null;
  if (seller.role !== 'seller' && seller.role !== 'admin') return null;

  const salesCount = await countSuccessfulSales(prismaClient, sellerId);
  if (salesCount < VERIFIED_SALES_THRESHOLD) return null;

  return prismaClient.user.update({
    where: { id: sellerId },
    data: {
      sellerVerified: true,
      sellerVerifiedAt: new Date(),
      sellerVerifiedBy: 'auto',
    },
    select: {
      id: true,
      sellerVerified: true,
      sellerVerifiedAt: true,
      sellerVerifiedBy: true,
    },
  });
}

async function verifySellersForDeliveredOrder(prismaClient, orderId) {
  const order = await prismaClient.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: { product: { select: { sellerId: true } } },
      },
    },
  });

  if (!order || order.status !== 'delivered') return;

  const sellerIds = [...new Set(order.items.map((item) => item.product.sellerId))];
  await Promise.all(sellerIds.map((sellerId) => maybeAutoVerifySeller(prismaClient, sellerId)));
}

module.exports = {
  VERIFIED_SALES_THRESHOLD,
  countSuccessfulSales,
  maybeAutoVerifySeller,
  verifySellersForDeliveredOrder,
};
