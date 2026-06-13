const SERVICE_FEE = 2500;
const SHIPPING_FEE = 12000;

function computeOrderTotal(subtotal) {
  return subtotal + SERVICE_FEE + SHIPPING_FEE;
}

function buildOrderBreakdown(subtotal, itemCount) {
  return {
    subtotal,
    serviceFee: SERVICE_FEE,
    shippingFee: SHIPPING_FEE,
    itemCount,
    totalPrice: computeOrderTotal(subtotal),
  };
}

module.exports = {
  SERVICE_FEE,
  SHIPPING_FEE,
  computeOrderTotal,
  buildOrderBreakdown,
};
