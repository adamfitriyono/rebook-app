import { Link } from 'react-router-dom';
import { BookOpen, ShoppingBag, Package, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    icon: BookOpen,
    label: 'Cara jualan',
    description: 'Foto buku, atur harga, publikasikan listing.',
    to: '/seller/sell',
  },
  {
    icon: ShoppingBag,
    label: 'Cara belanja',
    description: 'Jelajahi katalog, tambah keranjang, checkout.',
    to: '/catalog',
  },
  {
    icon: Package,
    label: 'Proses pesanan',
    description: 'Bayar, lacak pengiriman, konfirmasi diterima.',
    to: '/orders',
  },
  {
    icon: ShieldCheck,
    label: 'Aman',
    description: 'Perlindungan pembeli & transaksi terpantau.',
    to: '/perlindungan-pembeli',
  },
];

export default function FooterHowItWorks() {
  return (
    <section className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-content mx-auto px-4 py-12 md:py-14">
        <h2 className="text-xl md:text-2xl font-bold text-heading mb-8 md:mb-10">
          Cara pakai ReBook
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <Link
                key={step.label}
                to={step.to}
                className="group flex flex-col items-center text-center gap-3"
              >
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full border-[3px] border-primary p-1 flex items-center justify-center bg-primary/5 transition-transform duration-200 group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/20">
                  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
                    <Icon
                      size={36}
                      className="text-primary transition-colors group-hover:text-primary/80"
                      strokeWidth={1.75}
                    />
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-heading text-sm md:text-base group-hover:text-primary transition-colors">
                    {step.label}
                  </p>
                  <p className="text-xs text-subtle mt-1 hidden sm:block max-w-[160px] mx-auto leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
