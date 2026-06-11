import { ORDER_STATUS_LABELS } from '../../utils/constants';

const STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  paid: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  delivered: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const DOT_STYLES = {
  pending: 'bg-amber-500',
  paid: 'bg-blue-500',
  shipped: 'bg-purple-500',
  delivered: 'bg-green-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
};

export default function StatusBadge({ status }) {
  const label = ORDER_STATUS_LABELS[status] || status;
  const style = STATUS_STYLES[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
  const dot = DOT_STYLES[status] || 'bg-gray-400';

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${style}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
