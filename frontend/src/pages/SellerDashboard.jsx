import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck } from 'lucide-react';
import Loading from '../components/common/Loading';
import ConfirmModal from '../components/common/ConfirmModal';
import OrderStatusTracker from '../components/order/OrderStatusTracker';
import { getDashboardStats } from '../services/users';
import { getSellerOrders, updateOrderStatus } from '../services/orders';
import { toast } from '../store/useToastStore';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { formatDate } from '../utils/formatters';
import { getOrderProductTitle, canMarkShipped } from '../utils/orderHelpers';

export default function SellerDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [shipTarget, setShipTarget] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');

  const fetchData = () => {
    Promise.all([getDashboardStats(), getSellerOrders()])
      .then(([statsRes, ordersRes]) => {
        setStats(statsRes.data.data);
        setOrders(ordersRes.data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShip = async () => {
    if (!shipTarget || !trackingNumber.trim()) {
      toast.error('Nomor resi wajib diisi');
      return;
    }
    try {
      setUpdatingId(shipTarget);
      await updateOrderStatus(shipTarget, {
        status: 'shipped',
        trackingNumber: trackingNumber.trim(),
      });
      toast.success('Pesanan ditandai sebagai dikirim');
      setShipTarget(null);
      setTrackingNumber('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui status');
    } finally {
      setUpdatingId(null);
    }
  };

  const uniqueOrders = orders.reduce((acc, item) => {
    if (!acc.find((o) => o.orderId === item.order.id)) {
      acc.push({
        orderId: item.order.id,
        status: item.order.status,
        trackingNumber: item.order.trackingNumber,
        buyer: item.order.buyer,
        createdAt: item.order.createdAt,
        items: orders.filter((o) => o.order.id === item.order.id),
      });
    }
    return acc;
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <ConfirmModal
        open={!!shipTarget}
        title="Tandai Dikirim"
        message={
          <div className="space-y-3 text-left">
            <p className="text-sm text-muted">Masukkan nomor resi pengiriman sebelum menandai pesanan sebagai dikirim.</p>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Contoh: JNE1234567890"
              className="input-field"
              autoFocus
            />
          </div>
        }
        confirmLabel="Kirim"
        onConfirm={handleShip}
        onCancel={() => {
          setShipTarget(null);
          setTrackingNumber('');
        }}
      />

      <h1 className="text-2xl font-bold text-heading mb-6">Dashboard Penjual</h1>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="surface-card p-4">
          <p className="text-sm text-subtle">Total Listing</p>
          <p className="text-2xl font-bold text-primary">{stats?.sellerStats?.totalListings || 0}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-subtle">Listing Aktif</p>
          <p className="text-2xl font-bold text-primary">{stats?.sellerStats?.activeListings || 0}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-subtle">Total Terjual</p>
          <p className="text-2xl font-bold text-primary">{stats?.sellerStats?.totalSold || 0}</p>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <Link to="/sell" className="bg-primary text-white px-4 py-2 rounded-lg text-sm">+ Jual Buku</Link>
        <Link to="/my-listings" className="border border-primary text-primary px-4 py-2 rounded-lg text-sm">Kelola Listing</Link>
      </div>

      <h2 className="text-lg font-bold mb-4">Pesanan Masuk</h2>
      {uniqueOrders.length === 0 ? (
        <p className="text-subtle">Belum ada pesanan.</p>
      ) : (
        <div className="space-y-4">
          {uniqueOrders.map((order) => (
            <div key={order.orderId} className="surface-card p-4">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                <div>
                  <p className="font-medium">{getOrderProductTitle({ items: order.items })}</p>
                  <p className="text-sm text-subtle">
                    {order.buyer.fullName} &middot; {formatDate(order.createdAt)}
                  </p>
                </div>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded">
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              <OrderStatusTracker status={order.status} compact />

              <ul className="text-sm text-muted space-y-1 my-3">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.product.title} &times; {item.quantity}
                  </li>
                ))}
              </ul>

              {order.trackingNumber && (
                <p className="text-sm text-primary mt-2">
                  Resi: <span className="font-medium">{order.trackingNumber}</span>
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Link
                  to={`/orders/${order.orderId}`}
                  className="text-sm text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary/5"
                >
                  Detail
                </Link>
                {canMarkShipped(order) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShipTarget(order.orderId);
                      setTrackingNumber('');
                    }}
                    disabled={updatingId === order.orderId}
                    className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50"
                  >
                    <Truck size={16} />
                    {updatingId === order.orderId ? 'Memproses...' : 'Tandai Dikirim'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
