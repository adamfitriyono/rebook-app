import { ShieldCheck, RotateCcw, PackageCheck, Headphones } from 'lucide-react';
import BackButton from '../components/common/BackButton';

const BENEFITS = [
  {
    icon: RotateCcw,
    title: 'Garansi pengembalian dana',
    description:
      'Jika buku tidak sesuai deskripsi atau rusak parah saat sampai, Anda berhak mengajukan pengembalian dana sesuai kebijakan ReBook.',
  },
  {
    icon: PackageCheck,
    title: 'Buku sesuai kondisi tertera',
    description:
      'Setiap listing menampilkan kondisi buku (baru, seperti baru, baik, dll.) yang telah dikurasi penjual agar Anda tahu apa yang dibeli.',
  },
  {
    icon: ShieldCheck,
    title: 'Transaksi terpantau',
    description:
      'Pembayaran dan status pesanan tercatat di sistem. Lacak pesanan dari pembayaran hingga buku diterima.',
  },
  {
    icon: Headphones,
    title: 'Dukungan pembeli',
    description:
      'Tim ReBook siap membantu menengahi masalah antara pembeli dan penjual melalui layanan pelanggan.',
  },
];

export default function BuyerProtection() {
  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <BackButton fallback="/" className="mb-4" />

      <div className="surface-card p-6 md:p-8 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-sky-100 dark:bg-sky-900/60 flex items-center justify-center shrink-0">
            <ShieldCheck size={28} className="text-sky-500 dark:text-sky-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-heading">Perlindungan Pembeli</h1>
            <p className="text-sm text-muted mt-1">
              Belanja buku bekas di ReBook dengan lebih tenang.
            </p>
          </div>
        </div>

        <p className="text-sm text-muted leading-relaxed mb-8">
          Perlindungan Pembeli ReBook dirancang agar Anda bisa bertransaksi dengan percaya diri.
          Kami membantu memastikan pengalaman belanja yang adil antara pembeli dan penjual.
        </p>

        <div className="space-y-6">
          {BENEFITS.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-4">
              <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon size={20} className="text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-heading text-sm">{title}</h2>
                <p className="text-sm text-muted mt-1 leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-heading text-sm mb-2">Cara mengajukan klaim</h2>
          <ol className="text-sm text-muted space-y-2 list-decimal list-inside leading-relaxed">
            <li>Buka detail pesanan di menu <strong className="text-heading">Pesanan</strong>.</li>
            <li>Hubungi penjual lewat chat jika ada masalah dengan buku.</li>
            <li>Jika tidak terselesaikan, hubungi layanan pelanggan ReBook melalui ikon CS di pojok kanan bawah.</li>
            <li>Sertakan foto buku dan deskripsi masalah untuk proses verifikasi lebih cepat.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
