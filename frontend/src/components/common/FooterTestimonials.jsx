import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import { FOOTER_TESTIMONIALS } from '../../data/footerTestimonials';

function TestimonialCard({ item }) {
  return (
    <article className="surface-card p-4 flex flex-col gap-3 h-full transition-shadow duration-200 hover:shadow-md dark:hover:shadow-gray-900/40">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/images/user-pic-default.svg"
            alt=""
            className="w-9 h-9 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
          />
          <div className="min-w-0">
            <p className="font-semibold text-sm text-heading truncate">{item.userName}</p>
            <p className="text-xs text-subtle">{item.role}</p>
          </div>
        </div>
        <Link
          to={item.productLink}
          className="shrink-0 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:opacity-90 transition-opacity"
          title={item.productTitle}
        >
          <img
            src={item.productImage}
            alt={item.productTitle}
            className="w-12 h-14 object-cover"
          />
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              className={
                star <= item.rating
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300 dark:text-gray-600'
              }
            />
          ))}
        </div>
        <span className="text-xs text-subtle">{item.timeAgo}</span>
      </div>

      <p className="text-sm text-muted leading-relaxed flex-1">{item.comment}</p>
    </article>
  );
}

export default function FooterTestimonials() {
  return (
    <section className="relative bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-800 overflow-hidden">
      <div className="max-w-content mx-auto px-4 py-12 md:py-14">
        <div className="text-center max-w-2xl mx-auto mb-8 md:mb-10">
          <h2 className="text-xl md:text-2xl font-bold text-heading mb-3">
            Aman dan terlindungi
          </h2>
          <p className="text-sm text-muted leading-relaxed">
            Komunitas jual beli buku bekas yang aman — pembeli dan penjual berbagi pengalaman
            nyata setelah transaksi selesai.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 relative">
          {FOOTER_TESTIMONIALS.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-900/90 to-transparent"
          aria-hidden
        />

        <div className="relative z-10 flex justify-center mt-6 md:-mt-4">
          <Link
            to="/catalog"
            className="btn-primary px-8 py-3 shadow-sm hover:shadow-md transition-shadow"
          >
            Jelajahi Katalog Buku
          </Link>
        </div>
      </div>
    </section>
  );
}
