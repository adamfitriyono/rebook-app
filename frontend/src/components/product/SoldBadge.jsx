export default function SoldBadge({ className = '' }) {
  return (
    <div
      className={`absolute inset-0 z-20 flex items-center justify-center bg-black/45 pointer-events-none ${className}`}
      aria-label="Terjual"
    >
      <span className="bg-gray-900/85 text-white text-xl sm:text-2xl font-bold px-8 py-3 rounded-lg tracking-[0.2em] border-2 border-white/25 shadow-lg">
        TERJUAL
      </span>
    </div>
  );
}
