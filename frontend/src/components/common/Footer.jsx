import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-12">
      <div className="max-w-content mx-auto px-4 py-10">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-primary mb-3">ReBook</h3>
            <p className="text-gray-300 text-sm">Buku Lama, Ilmu Baru. Marketplace buku bekas terkurasi terpercaya.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Navigasi</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/" className="hover:text-white">Beranda</Link></li>
              <li><Link to="/catalog" className="hover:text-white">Katalog</Link></li>
              <li><Link to="/register" className="hover:text-white">Daftar</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Kontak</h4>
            <p className="text-sm text-gray-300">Email: hello@rebook.id</p>
            <p className="text-sm text-gray-300">Semarang, Indonesia</p>
          </div>
        </div>
        <div className="border-t border-gray-600 mt-8 pt-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} ReBook. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
