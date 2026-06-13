import { BadgeCheck } from 'lucide-react';

export default function VerifiedSellerBadge({
  verified = false,
  className = '',
  size = 14,
  showLabel = true,
}) {
  if (!verified) return null;

  return (
    <span
      className={`inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 shrink-0 ${className}`}
      title="Penjual terverifikasi"
    >
      <BadgeCheck size={size} className="fill-blue-600 text-white dark:fill-blue-400 dark:text-gray-900" />
      {showLabel && <span className="text-xs font-medium">Terverifikasi</span>}
    </span>
  );
}
