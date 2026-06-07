export function getOrderProductTitle(order) {
  const items = order?.items || [];
  if (items.length === 0) return 'Pesanan';
  if (items.length === 1) return items[0].product?.title || 'Pesanan';
  const first = items[0].product?.title || 'Produk';
  return `${first} +${items.length - 1} lainnya`;
}

export function canCancelOrder(order) {
  return order?.status === 'pending' && order?.paymentStatus === 'unpaid';
}

export function canConfirmReceived(order) {
  return order?.status === 'shipped';
}

export function canPayOrder(order) {
  return order?.status === 'pending' && order?.paymentStatus === 'unpaid';
}

export function canMarkShipped(order) {
  return order?.status === 'paid';
}

const STATUS_STEP_INDEX = {
  pending: 0,
  paid: 1,
  shipped: 2,
  delivered: 3,
  completed: 3,
  cancelled: -1,
};

export function getOrderStepIndex(status) {
  return STATUS_STEP_INDEX[status] ?? 0;
}
