const ALLOWED_PAYMENT_METHODS = [
  'gopay',
  'ovo',
  'dana',
  'qris',
  'bca_va',
  'mandiri_va',
  'bri_va',
];

function isValidPaymentMethod(method) {
  return typeof method === 'string' && ALLOWED_PAYMENT_METHODS.includes(method);
}

module.exports = {
  ALLOWED_PAYMENT_METHODS,
  isValidPaymentMethod,
};
