import { Check, Minus } from 'lucide-react';

export default function SelectionCheckbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  label,
  size = 'md',
}) {
  const boxSize = size === 'sm' ? 'w-5 h-5 rounded-md' : 'w-6 h-6 rounded-lg';
  const iconSize = size === 'sm' ? 12 : 14;
  const isActive = checked || indeterminate;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`${boxSize} border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
        isActive
          ? 'border-primary bg-primary text-white shadow-sm shadow-primary/25 scale-100'
          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary/60 hover:shadow-sm'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {checked && <Check size={iconSize} strokeWidth={3} />}
      {indeterminate && !checked && <Minus size={iconSize} strokeWidth={3} />}
    </button>
  );
}
