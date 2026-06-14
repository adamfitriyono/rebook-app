async function decrementStockForOrder(tx, orderId) {
  const orderItems = await tx.orderItem.findMany({
    where: { orderId },
    include: {
      product: { select: { id: true, title: true, stock: true, available: true } },
    },
  });

  for (const item of orderItems) {
    const product = item.product;
    if (!product.available) {
      const err = new Error(`Produk "${product.title}" tidak tersedia`);
      err.status = 400;
      throw err;
    }
    if (product.stock < item.quantity) {
      const err = new Error(
        `Stok "${product.title}" tidak mencukupi (tersisa ${product.stock})`,
      );
      err.status = 400;
      throw err;
    }
  }

  for (const item of orderItems) {
    const updated = await tx.product.updateMany({
      where: {
        id: item.productId,
        stock: { gte: item.quantity },
        available: true,
      },
      data: {
        sold: { increment: item.quantity },
        stock: { decrement: item.quantity },
      },
    });

    if (updated.count === 0) {
      const err = new Error('Stok produk tidak mencukupi. Silakan coba lagi.');
      err.status = 400;
      throw err;
    }
  }
}

async function clearCartItemsForOrder(tx, userId, orderId) {
  const orderItems = await tx.orderItem.findMany({
    where: { orderId },
    select: { productId: true },
  });
  if (!orderItems.length) return;

  const cart = await tx.cart.findUnique({ where: { userId } });
  if (!cart) return;

  const productIds = orderItems.map((item) => item.productId);
  await tx.cartItem.deleteMany({
    where: { cartId: cart.id, productId: { in: productIds } },
  });
}

module.exports = {
  decrementStockForOrder,
  clearCartItemsForOrder,
};
