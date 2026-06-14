export const CONDITION_LABELS = {
  like_new: 'Seperti Baru',
  good: 'Bagus',
  fair: 'Cukup',
};

export const ORDER_STATUS_LABELS = {
  pending: 'Menunggu',
  paid: 'Dibayar',
  shipped: 'Dikirim',
  delivered: 'Diterima',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

export const ORDER_STATUS_FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: 'pending', label: 'Menunggu' },
  { value: 'paid', label: 'Dibayar' },
  { value: 'shipped', label: 'Dikirim' },
  { value: 'delivered', label: 'Diterima' },
  { value: 'cancelled', label: 'Dibatalkan' },
];

export const DISPUTE_STATUS_LABELS = {
  open: 'Terbuka',
  in_progress: 'Diproses',
  resolved: 'Selesai',
  closed: 'Ditutup',
};
