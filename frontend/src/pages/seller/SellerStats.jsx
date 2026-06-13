import { useEffect, useState } from 'react';
import { Eye, Wallet, ShoppingBag, Package } from 'lucide-react';
import Loading from '../../components/common/Loading';
import { getSellerAnalytics } from '../../services/users';
import { formatPrice } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/media';

export default function SellerStats() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSellerAnalytics()
      .then(({ data: res }) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  const summary = data?.summary;
  const products = data?.products || [];

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-heading">Statistik Toko</h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Views', value: summary?.totalViews ?? 0, icon: Eye },
          { label: 'Pendapatan Total', value: formatPrice(summary?.totalRevenue ?? 0), icon: Wallet },
          { label: 'Bulan Ini', value: formatPrice(summary?.monthlyRevenue ?? 0), icon: Wallet },
          { label: 'Pesanan Dibayar', value: summary?.paidOrderCount ?? 0, icon: ShoppingBag },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="surface-card p-4 rounded-2xl">
            <div className="flex items-center gap-2 text-subtle text-xs mb-2">
              <Icon size={16} />
              {label}
            </div>
            <p className="text-2xl font-bold text-heading">{value}</p>
          </div>
        ))}
      </div>

      <div className="surface-card rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-semibold text-heading flex items-center gap-2">
            <Package size={18} />
            Performa per Produk
          </h3>
        </div>

        {products.length === 0 ? (
          <p className="p-6 text-sm text-subtle">Belum ada produk.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-subtle border-b border-gray-100 dark:border-gray-800">
                  <th className="p-4 font-medium">Produk</th>
                  <th className="p-4 font-medium">Views</th>
                  <th className="p-4 font-medium">Terjual</th>
                  <th className="p-4 font-medium">Pendapatan</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <img
                          src={resolveMediaUrl(p.images?.[0])}
                          alt=""
                          className="w-10 aspect-[3/4] object-cover rounded"
                        />
                        <span className="font-medium text-heading line-clamp-2">{p.title}</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted">{p.viewCount}</td>
                    <td className="p-4 text-muted">{p.sold}</td>
                    <td className="p-4 font-medium text-primary">{formatPrice(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="text-xs text-subtle">
        Views dihitung setiap kali halaman detail produk dibuka. Pendapatan dari pesanan dengan status dibayar.
      </p>
    </div>
  );
}
