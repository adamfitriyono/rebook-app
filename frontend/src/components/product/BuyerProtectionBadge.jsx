import { Link } from 'react-router-dom';
import { ShieldCheck, ChevronRight } from 'lucide-react';

export default function BuyerProtectionBadge({ className = '' }) {
  return (
    <Link
      to="/perlindungan-pembeli"
      className={`flex items-center gap-3 w-full p-3 rounded-xl border border-sky-200 dark:border-sky-800 bg-sky-50/50 dark:bg-sky-950/30 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition group ${className}`}
    >
      <div className="shrink-0 w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center">
        <ShieldCheck size={22} className="text-sky-500 dark:text-sky-400" />
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="font-semibold text-sm text-heading">Perlindungan Pembeli</p>
        <p className="text-xs text-subtle mt-0.5 leading-snug">
          Belanja di REBOOK aman dengan garansi pengembalian dana.
        </p>
      </div>
      <ChevronRight
        size={18}
        className="shrink-0 text-gray-400 group-hover:text-sky-500 transition"
      />
    </Link>
  );
}
