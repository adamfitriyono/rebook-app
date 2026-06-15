import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  PackageCheck,
  ShoppingBag,
  Eye,
  Wallet,
  Clock,
  PlusCircle,
  ChevronRight,
  Users,
} from 'lucide-react';
import Loading from '../../components/common/Loading';
import StatusBadge from '../../components/common/StatusBadge';
import { getDashboardStats } from '../../services/users';
import { getSellerOrders } from '../../services/orders';
import { formatDate, formatPrice } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/media';
import { getOrderProductTitle } from '../../utils/orderHelpers';

const KPI_CARDS = [
  { key: 'activeListings', label: 'Listing Aktif', icon: PackageCheck, format: 'number' },
  { key: 'pendingOrders', label: 'Pesanan Perlu Diproses', icon: Clock, format: 'number' },
  { key: 'followerCount', label: 'Pengikut', icon: Users, format: 'number' },
  { key: 'totalViews', label: 'Total Views', icon: Eye, format: 'number' },
  { key: 'monthlyRevenue', label: 'Pendapatan Bulan Ini', icon: Wallet, format: 'currency' },
  { key: 'totalSold', label: 'Total Terjual', icon: ShoppingBag, format: 'number' },
  { key: 'totalListings', label: 'Total Listing', icon: Package, format: 'number' },
];

function formatValue(value, format) {
  if (format === 'currency') return formatPrice(value || 0);
  return value ?? 0;
}

export default function SellerOverview() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getDashboardStats(), getSellerOrders()])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data.data?.sellerStats);
        const orders = ordersRes.data.data || [];
        const unique = orders.reduce((acc, item) => {
          if (!acc.find((o) => o.orderId === item.order.id)) {
            acc.push({
              orderId: item.order.id,
              status: item.order.status,
              buyer: item.order.buyer,
              createdAt: item.order.createdAt,
              items: orders.filter((o) => o.order.id === item.order.id),
            });
          }
          return acc;
        }, []);
        setRecentOrders(unique.slice(0, 5));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {KPI_CARDS.map(({ key, label, icon: Icon, format }) => (
          <div key={key} className="surface-card p-4 rounded-2xl flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Icon size={22} className="text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-subtle truncate">{label}</p>
              <p className="text-xl font-bold text-heading">
                {formatValue(stats?.[key], format)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/seller/sell" className="btn-primary flex items-center gap-2">
          <PlusCircle size={18} />
          Jual Buku Baru
        </Link>
        <Link to="/seller/listings" className="btn-outline">
          Kelola Listing
        </Link>
        <Link to="/seller/stats" className="btn-outline">
          Lihat Statistik
        </Link>
      </div>

      <div className="surface-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-heading">Pesanan Terbaru</h2>
          <Link to="/seller/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
            Lihat semua
            <ChevronRight size={16} />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-subtle">Belum ada pesanan masuk.</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => {
              const thumb = order.items[0]?.product?.images?.[0];
              return (
                <Link
                  key={order.orderId}
                  to="/seller/orders"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
                >
                  <img
                    src={resolveMediaUrl(thumb, 'https://picsum.photos/60/80')}
                    alt=""
                    className="w-12 aspect-[3/4] object-cover rounded shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-heading truncate">
                      {getOrderProductTitle({ items: order.items })}
                    </p>
                    <p className="text-xs text-subtle">
                      {order.buyer?.fullName} · {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {stats?.totalRevenue > 0 && (
        <p className="text-sm text-subtle">
          Total pendapatan sepanjang waktu:{' '}
          <span className="font-semibold text-heading">{formatPrice(stats.totalRevenue)}</span>
        </p>
      )}
    </div>
  );
}
