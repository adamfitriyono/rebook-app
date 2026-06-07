import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SLIDES = [
  {
    id: 1,
    title: 'Buku Lama, Ilmu Baru',
    subtitle: 'Hemat 40–60% untuk buku bekas berkualitas',
    cta: 'Jelajahi Katalog',
    link: '/catalog',
    bg: 'linear-gradient(135deg, #8CC63E 0%, #6BA832 100%)',
    image: 'https://picsum.photos/seed/rebook-promo1/1200/400',
  },
  {
    id: 2,
    title: 'Grading Transparan',
    subtitle: 'Kondisi buku terverifikasi: Seperti Baru, Bagus, Cukup',
    cta: 'Lihat Produk',
    link: '/catalog?condition=like_new',
    bg: 'linear-gradient(135deg, #1E2838 0%, #028090 100%)',
    image: 'https://picsum.photos/seed/rebook-promo2/1200/400',
  },
  {
    id: 3,
    title: 'Mulai Berjualan',
    subtitle: 'Daftar sebagai penjual dan jangkau pembaca di seluruh Indonesia',
    cta: 'Daftar Sekarang',
    link: '/register',
    bg: 'linear-gradient(135deg, #FF9800 0%, #F57C00 100%)',
    image: 'https://picsum.photos/seed/rebook-promo3/1200/400',
  },
];

export default function PromoBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  const goTo = (index) => setCurrent(index);
  const prev = () => setCurrent((c) => (c - 1 + SLIDES.length) % SLIDES.length);
  const next = () => setCurrent((c) => (c + 1) % SLIDES.length);

  return (
    <div className="relative rounded-lg overflow-hidden mb-6 h-48 md:h-56 group">
      {SLIDES.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <img src={s.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/45 flex flex-col justify-center px-8 md:px-12">
            <h2 className="text-white text-xl md:text-3xl font-bold mb-2">{s.title}</h2>
            <p className="text-white/90 text-sm md:text-base mb-4 max-w-lg">{s.subtitle}</p>
            <Link
              to={s.link}
              className="inline-block w-fit bg-white text-dark px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-100 transition"
            >
              {s.cta}
            </Link>
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
        aria-label="Slide sebelumnya"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        type="button"
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
        aria-label="Slide berikutnya"
      >
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            className={`w-2 h-2 rounded-full transition ${
              i === current ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
