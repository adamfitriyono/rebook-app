export const PAYMENT_METHOD_GROUPS = [
  {
    id: 'ewallet',
    label: 'E-wallet',
    methods: [
      { id: 'gopay', label: 'GoPay', icon: '/images/payment-icon/gopay.svg' },
      { id: 'ovo', label: 'OVO', icon: '/images/payment-icon/ovo.svg' },
      { id: 'dana', label: 'DANA', icon: '/images/payment-icon/Logo_dana_blue.svg' },
    ],
  },
  {
    id: 'qris',
    label: 'QRIS',
    methods: [
      { id: 'qris', label: 'QRIS', icon: '/images/payment-icon/qris.svg' },
    ],
  },
  {
    id: 'va',
    label: 'Virtual Account',
    methods: [
      { id: 'bca_va', label: 'BCA Virtual Account', icon: '/images/payment-icon/Bank_Central_Asia.svg' },
      { id: 'mandiri_va', label: 'Mandiri Virtual Account', icon: '/images/payment-icon/mandiriva.svg' },
      { id: 'bri_va', label: 'BRI Virtual Account', icon: '/images/payment-icon/briva.svg' },
    ],
  },
];

const PAYMENT_METHOD_LABELS = PAYMENT_METHOD_GROUPS.reduce((acc, group) => {
  group.methods.forEach((method) => {
    acc[method.id] = method.label;
  });
  return acc;
}, {});

export function formatPaymentMethod(id) {
  if (!id) return '-';
  return PAYMENT_METHOD_LABELS[id] || id;
}

export function isValidPaymentMethod(id) {
  return Boolean(PAYMENT_METHOD_LABELS[id]);
}
