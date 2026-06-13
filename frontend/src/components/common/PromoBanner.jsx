import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getActiveBanners } from '../../services/banners';

const FALLBACK_SLIDES = [
  {
    id: 'fallback-1',
    title: 'Buku Lama, Ilmu Baru',
    subtitle: 'Hemat 40–60% untuk buku bekas berkualitas',
    cta: 'Jelajahi Katalog',
    link: '/catalog',
    bgGradient: 'linear-gradient(135deg, #8CC63E 0%, #6BA832 100%)',
    imageUrl: 'https://picsum.photos/seed/rebook-promo1/1200/400',
  },
];

export default function PromoBanner() {
  const [slides, setSlides] = useState(FALLBACK_SLIDES);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    getActiveBanners()
      .then(({ data }) => {
        if (data.data?.length) setSlides(data.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[current] || slides[0];
  const goTo = (index) => setCurrent(index);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent((c) => (c + 1) % slides.length);

  return (
    <div className="relative rounded-lg overflow-hidden mb-6 h-48 md:h-56 group">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {s.imageUrl && (
            <img src={s.imageUrl} alt="" className="w-full h-full object-cover" />
          )}
          <div
            className="absolute inset-0 flex flex-col justify-center px-8 md:px-12"
            style={{
              background: s.imageUrl
                ? 'rgba(0,0,0,0.45)'
                : s.bgGradient || 'linear-gradient(135deg, #8CC63E 0%, #6BA832 100%)',
            }}
          >
            <h2 className="text-white text-xl md:text-3xl font-bold mb-2">{s.title}</h2>
            {s.subtitle && (
              <p className="text-white/90 text-sm md:text-base mb-4 max-w-lg">{s.subtitle}</p>
            )}
            <Link
              to={s.link || '/catalog'}
              className="inline-block w-fit bg-white text-dark px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
            >
              {s.cta || 'Lihat'}
            </Link>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <>
          <button type="button" onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition" aria-label="Slide sebelumnya">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition" aria-label="Slide berikutnya">
            <ChevronRight size={20} />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((s, i) => (
              <button key={s.id} type="button" onClick={() => goTo(i)} className={`w-2 h-2 rounded-full transition ${i === current ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`} aria-label={`Slide ${i + 1}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
