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
