import { Link, useLocation } from 'react-router-dom';
import { Instagram, Facebook } from 'lucide-react';
import FooterHowItWorks from './FooterHowItWorks';
import FooterTestimonials from './FooterTestimonials';

function TikTokIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

function XIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { href: 'https://instagram.com', label: 'Instagram', icon: Instagram },
  { href: 'https://tiktok.com', label: 'TikTok', icon: TikTokIcon },
  { href: 'https://facebook.com', label: 'Facebook', icon: Facebook },
  { href: 'https://x.com', label: 'X', icon: XIcon },
];

export default function Footer() {
  const { pathname } = useLocation();
  const showMarketingSections = pathname === '/' || pathname === '/catalog';

  return (
    <>
      {showMarketingSections && (
        <>
          <FooterHowItWorks />
          <FooterTestimonials />
        </>
      )}

      <footer className="bg-dark dark:bg-gray-950 text-white border-t border-gray-800">
        <div className="max-w-content mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <img src="/images/logo-navbar.svg" alt="ReBook" className="h-10 mb-4 brightness-0 invert" />
              <p className="text-gray-300 text-sm leading-relaxed">
                Buku Lama, Ilmu Baru. Marketplace buku bekas terkurasi terpercaya.
              </p>
              <div className="flex gap-3 mt-4">
                {SOCIAL_LINKS.map(({ href, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                    aria-label={label}
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Navigasi</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/" className="hover:text-primary transition-colors">Beranda</Link></li>
                <li><Link to="/catalog" className="hover:text-primary transition-colors">Katalog</Link></li>
                <li><Link to="/seller/sell" className="hover:text-primary transition-colors">Jual Buku</Link></li>
                <li><Link to="/perlindungan-pembeli" className="hover:text-primary transition-colors">Perlindungan Pembeli</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Akun</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/login" className="hover:text-primary transition-colors">Login</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">Daftar</Link></li>
                <li><Link to="/orders" className="hover:text-primary transition-colors">Pesanan Saya</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Kontak</h4>
              <p className="text-sm text-gray-300">Email: hello@rebook.id</p>
              <p className="text-sm text-gray-300 mt-1">Semarang, Indonesia</p>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} ReBook. All rights reserved.</p>
            <Link to="#" className="hover:text-primary transition-colors">
              Kebijakan Privasi
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
