const { getPlatformFees, DEFAULTS } = require('./platformSettings');

async function computeOrderTotal(subtotal) {
  const { serviceFee, shippingFee } = await getPlatformFees();
  return subtotal + serviceFee + shippingFee;
}

async function buildOrderBreakdown(subtotal, itemCount) {
  const { serviceFee, shippingFee } = await getPlatformFees();
  return {
    subtotal,
    serviceFee,
    shippingFee,
    itemCount,
    totalPrice: subtotal + serviceFee + shippingFee,
  };
}

function buildOrderBreakdownSync(subtotal, itemCount, fees = DEFAULTS) {
  return {
    subtotal,
    serviceFee: fees.serviceFee,
    shippingFee: fees.shippingFee,
    itemCount,
    totalPrice: subtotal + fees.serviceFee + fees.shippingFee,
  };
}

module.exports = {
  DEFAULTS,
  computeOrderTotal,
  buildOrderBreakdown,
  buildOrderBreakdownSync,
  getPlatformFees,
};
