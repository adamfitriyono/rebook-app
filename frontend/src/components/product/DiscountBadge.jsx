export default function DiscountBadge({ percent, className = '' }) {
  if (!percent || percent <= 0) return null;

  return (
    <span
      className={`absolute top-2 right-2 z-10 bg-[#E43232] text-white text-xs font-bold px-2 py-1 rounded-md shadow-sm ${className}`}
    >
      -{percent}%
    </span>
  );
}
