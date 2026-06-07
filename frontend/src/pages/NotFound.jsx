import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="max-w-content mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted mb-6">Halaman tidak ditemukan.</p>
      <Link to="/" className="text-primary hover:underline">Kembali ke Beranda</Link>
    </div>
  );
}
