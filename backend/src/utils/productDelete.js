async function safeDeleteProduct(prisma, productId) {
  const orderItemCount = await prisma.orderItem.count({ where: { productId } });
  if (orderItemCount > 0) {
    const err = new Error(
      'Listing tidak bisa dihapus karena sudah pernah dipesan. Nonaktifkan listing atau set stok ke 0.',
    );
    err.status = 400;
    throw err;
  }

  await prisma.$transaction(async (tx) => {
    await tx.cartItem.deleteMany({ where: { productId } });
    await tx.wishlistItem.deleteMany({ where: { productId } });
    await tx.product.delete({ where: { id: productId } });
  });
}

module.exports = { safeDeleteProduct };
