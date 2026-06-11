import { Link } from 'react-router-dom';
import { Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark dark:bg-gray-950 text-white mt-12 border-t border-gray-800">
      <div className="max-w-content mx-auto px-4 py-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <img src="/images/logo-navbar.svg" alt="ReBook" className="h-10 mb-4 brightness-0 invert" />
            <p className="text-gray-300 text-sm leading-relaxed">
              Buku Lama, Ilmu Baru. Marketplace buku bekas terkurasi terpercaya.
            </p>
            <div className="flex gap-3 mt-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-3">Navigasi</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-primary transition-colors">Beranda</Link></li>
              <li><Link to="/catalog" className="hover:text-primary transition-colors">Katalog</Link></li>
              <li><Link to="/sell" className="hover:text-primary transition-colors">Jual Buku</Link></li>
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
  );
}
