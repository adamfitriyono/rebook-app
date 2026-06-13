export const SERVICE_FEE = 2500;
export const SHIPPING_FEE = 12000;

export function computeOrderTotal(subtotal) {
  return subtotal + SERVICE_FEE + SHIPPING_FEE;
}

export function buildOrderBreakdown(subtotal, itemCount) {
  return {
    subtotal,
    serviceFee: SERVICE_FEE,
    shippingFee: SHIPPING_FEE,
    itemCount,
    totalPrice: computeOrderTotal(subtotal),
  };
}
