export const DEFAULT_FEES = { serviceFee: 2500, shippingFee: 12000 };

export function computeOrderTotal(subtotal, fees = DEFAULT_FEES) {
  return subtotal + fees.serviceFee + fees.shippingFee;
}

export function buildOrderBreakdown(subtotal, itemCount, fees = DEFAULT_FEES) {
  return {
    subtotal,
    serviceFee: fees.serviceFee,
    shippingFee: fees.shippingFee,
    itemCount,
    totalPrice: computeOrderTotal(subtotal, fees),
  };
}

export function groupCartItemsBySeller(items) {
  const map = new Map();

  items.forEach((item) => {
    const sellerId = item.product.seller?.id ?? item.product.sellerId ?? 'unknown';
    if (!map.has(sellerId)) {
      map.set(sellerId, {
        seller: item.product.seller || null,
        sellerId,
        items: [],
      });
    }
    map.get(sellerId).items.push(item);
  });

  return [...map.values()];
}

export function buildMultiSellerBreakdown(sellerGroups, fees = DEFAULT_FEES) {
  const groups = sellerGroups.map((group) => {
    const subtotal = group.items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
    const itemCount = group.items.reduce((sum, item) => sum + item.quantity, 0);
    const breakdown = buildOrderBreakdown(subtotal, itemCount, fees);
    return { ...group, ...breakdown };
  });

  const grandTotal = groups.reduce((sum, g) => sum + g.totalPrice, 0);
  const subtotal = groups.reduce((sum, g) => sum + g.subtotal, 0);
  const serviceFee = groups.reduce((sum, g) => sum + g.serviceFee, 0);
  const shippingFee = groups.reduce((sum, g) => sum + g.shippingFee, 0);
  const itemCount = groups.reduce((sum, g) => sum + g.itemCount, 0);

  return {
    groups,
    grandTotal,
    subtotal,
    serviceFee,
    shippingFee,
    itemCount,
    sellerCount: groups.length,
  };
}
