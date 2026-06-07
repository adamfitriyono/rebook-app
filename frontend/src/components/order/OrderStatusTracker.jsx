import { getOrderStepIndex } from '../../utils/orderHelpers';

const STEPS = [
  { key: 'pending', label: 'Menunggu Bayar' },
  { key: 'paid', label: 'Dibayar' },
  { key: 'shipped', label: 'Dikirim' },
  { key: 'delivered', label: 'Diterima' },
];

export default function OrderStatusTracker({ status, compact = false }) {
  if (status === 'cancelled') {
    return (
      <div className={`${compact ? 'text-xs' : 'text-sm'} text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-lg px-3 py-2 inline-block`}>
        Pesanan Dibatalkan
      </div>
    );
  }

  const currentStep = getOrderStepIndex(status);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STEPS.map((step, i) => (
          <div
            key={step.key}
            className={`h-2 rounded-full transition-all ${
              i <= currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
            } ${i === currentStep ? 'w-4' : 'w-2'}`}
            title={step.label}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="hidden sm:flex items-center justify-between">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex flex-col items-center flex-1 relative">
            {i < STEPS.length - 1 && (
              <div
                className={`absolute top-4 left-1/2 w-full h-0.5 ${
                  i < currentStep ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            )}
            <div
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                i <= currentStep ? 'bg-primary text-white' : 'step-inactive'
              }`}
            >
              {i + 1}
            </div>
            <span
              className={`mt-2 text-xs text-center ${
                i <= currentStep ? 'text-primary font-medium' : 'text-gray-400'
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>

      <div className="sm:hidden space-y-3">
        {STEPS.map((step, i) => (
          <div key={step.key} className="flex items-center gap-3">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                i <= currentStep ? 'bg-primary text-white' : 'step-inactive'
              }`}
            >
              {i + 1}
            </div>
            <span className={i <= currentStep ? 'text-primary font-medium text-sm' : 'text-gray-400 text-sm'}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
