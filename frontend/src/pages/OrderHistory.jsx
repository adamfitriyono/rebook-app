import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, CreditCard, XCircle, CheckCircle, ExternalLink } from 'lucide-react';
import Loading from '../components/common/Loading';
import ConfirmModal from '../components/common/ConfirmModal';
import EmptyState from '../components/common/EmptyState';
import StatusBadge from '../components/common/StatusBadge';
import OrderStatusTracker from '../components/order/OrderStatusTracker';
import { getOrders, confirmOrder, cancelOrder } from '../services/orders';
import { processPayment, processCheckoutPayment } from '../services/payments';
import { toast } from '../store/useToastStore';
import { formatPrice, formatDate } from '../utils/formatters';
import { resolveMediaUrl } from '../utils/media';
import {
  getOrderProductTitle,
  canCancelOrder,
  canConfirmReceived,
  canPayOrder,
} from '../utils/orderHelpers';
import { ORDER_STATUS_FILTERS } from '../utils/constants';
import Breadcrumb from '../components/common/Breadcrumb';
import { homeTrail, CRUMBS } from '../utils/breadcrumbs';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionId, setActionId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    const params = statusFilter === 'all' ? {} : { status: statusFilter };
    getOrders(params)
      .then(({ data }) => {
        let result = data.data;
        if (statusFilter === 'delivered') {
          result = result.filter((o) => o.status === 'delivered' || o.status === 'completed');
        }
        setOrders(result);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handlePay = async (order) => {
    try {
      setActionId(order.id);
      if (order.checkoutGroupId) {
        await processCheckoutPayment({
          checkoutGroupId: order.checkoutGroupId,
          paymentMethod: 'qris',
        });
      } else {
        await processPayment({
          orderId: order.id,
          amount: order.totalPrice,
          paymentMethod: 'qris',
        });
      }
      toast.success('Pembayaran berhasil!');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Pembayaran gagal');
    } finally {
      setActionId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      setActionId(cancelTarget);
      await cancelOrder(cancelTarget);
      toast.success('Pesanan dibatalkan');
      setCancelTarget(null);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal membatalkan');
    } finally {
      setActionId(null);
    }
  };

  const handleConfirm = async (orderId) => {
    try {
      setActionId(orderId);
      await confirmOrder(orderId);
      toast.success('Pesanan dikonfirmasi diterima');
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal konfirmasi');
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <ConfirmModal
        open={!!cancelTarget}
        title="Batalkan Pesanan"
        message="Apakah Anda yakin ingin membatalkan pesanan ini?"
        confirmLabel="Batalkan"
        danger
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />

      <Breadcrumb items={homeTrail(CRUMBS.orders)} />
      <h1 className="text-2xl font-bold text-heading mb-6">Riwayat Pesanan</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {ORDER_STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              statusFilter === f.value ? 'bg-primary text-white' : 'filter-pill-inactive'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Belum Ada Pesanan"
          description="Pesanan Anda akan muncul di sini setelah checkout."
          cta="Jelajahi Katalog"
          to="/catalog"
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const thumb = order.items?.[0]?.product?.images?.[0];
            return (
              <div key={order.id} className="surface-card p-4 rounded-2xl">
                <div className="flex gap-4 mb-3">
                  <img
                    src={resolveMediaUrl(thumb, 'https://picsum.photos/80/100')}
                    alt=""
                    className="w-16 h-20 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-heading truncate">{getOrderProductTitle(order)}</p>
                      {order.seller?.fullName && (
                        <p className="text-xs text-subtle truncate">{order.seller.fullName}</p>
                      )}
                      {order.checkoutGroupId && (
                        <p className="text-xs text-primary/80 mt-0.5">
                          Bagian checkout #{order.checkoutGroupId.slice(0, 8)}
                        </p>
                      )}
                      <p className="text-sm text-subtle mt-0.5">{formatDate(order.createdAt)}</p>
                      <p className="font-bold text-primary mt-2">{formatPrice(order.totalPrice)}</p>
                      <p className="text-sm text-muted mt-0.5">
                        {order.items.length} item &middot; {order.shippingCity}
                      </p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                </div>

                <OrderStatusTracker status={order.status} compact />

                <div className="flex flex-wrap gap-2 mt-4">
                  <Link to={`/orders/${order.id}`} className="btn-outline btn-sm">
                    <ExternalLink size={14} />
                    Detail
                  </Link>
                  {canPayOrder(order) && (
                    <button
                      type="button"
                      onClick={() => handlePay(order)}
                      disabled={actionId === order.id}
                      className="btn-primary btn-sm"
                    >
                      <CreditCard size={14} />
                      Bayar
                    </button>
                  )}
                  {canCancelOrder(order) && (
                    <button
                      type="button"
                      onClick={() => setCancelTarget(order.id)}
                      disabled={actionId === order.id}
                      className="btn-danger btn-sm"
                    >
                      <XCircle size={14} />
                      Batalkan
                    </button>
                  )}
                  {canConfirmReceived(order) && (
                    <button
                      type="button"
                      onClick={() => handleConfirm(order.id)}
                      disabled={actionId === order.id}
                      className="btn-primary btn-sm"
                    >
                      <CheckCircle size={14} />
                      Konfirmasi Diterima
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
