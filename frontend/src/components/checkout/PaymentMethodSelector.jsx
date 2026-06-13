import { PAYMENT_METHOD_GROUPS } from '../../utils/paymentMethods';

function PaymentMethodCard({ method, selected, onSelect }) {
  const isSelected = selected === method.id;

  return (
    <label
      className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
        isSelected
          ? 'border-primary bg-primary/5'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={method.id}
        checked={isSelected}
        onChange={() => onSelect(method.id)}
        className="sr-only"
      />
      <img
        src={method.icon}
        alt={method.label}
        className="h-8 w-16 object-contain shrink-0"
      />
      <span className="text-sm font-medium text-heading">{method.label}</span>
    </label>
  );
}

export default function PaymentMethodSelector({ value, onChange, error }) {
  return (
    <div className="space-y-5">
      {PAYMENT_METHOD_GROUPS.map((group) => (
        <div key={group.id}>
          <h3 className="text-sm font-semibold text-heading mb-3">{group.label}</h3>
          <div className={`grid gap-3 ${group.methods.length > 1 ? 'sm:grid-cols-2' : ''}`}>
            {group.methods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                selected={value}
                onSelect={onChange}
              />
            ))}
          </div>
        </div>
      ))}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}
