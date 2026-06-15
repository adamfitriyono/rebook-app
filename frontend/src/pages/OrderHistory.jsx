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
import { useCartStore } from '../store/useAuthStore';
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
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionId, setActionId] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [payTarget, setPayTarget] = useState(null);

  const fetchOrders = () => {
    setLoading(true);
    const params = statusFilter === 'all' ? {} : { status: statusFilter };
    getOrders(params)
      .then(({ data }) => {
        setOrders(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const getGroupUnpaidOrders = (order) => {
    if (!order.checkoutGroupId) return [];
    return orders.filter(
      (o) =>
        o.checkoutGroupId === order.checkoutGroupId &&
        o.paymentStatus !== 'paid' &&
        o.status !== 'cancelled' &&
        o.id !== order.id,
    );
  };

  const handlePayConfirmed = async (order) => {
    setPayTarget(null);
    try {
      setActionId(order.id);
      if (order.checkoutGroupId) {
        await processCheckoutPayment({
          checkoutGroupId: order.checkoutGroupId,
          paymentMethod: 'qris',
        });
        const otherCount = getGroupUnpaidOrders(order).length;
        toast.success(
          otherCount > 0
            ? `Pembayaran berhasil! ${otherCount + 1} pesanan telah dibayar.`
            : 'Pembayaran berhasil!',
        );
      } else {
        await processPayment({
          orderId: order.id,
          amount: order.totalPrice,
          paymentMethod: 'qris',
        });
        toast.success('Pembayaran berhasil!');
      }
      await fetchCart();
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Pembayaran gagal');
    } finally {
      setActionId(null);
    }
  };

  const handlePay = (order) => {
    const otherUnpaid = getGroupUnpaidOrders(order);
    if (otherUnpaid.length > 0) {
      setPayTarget(order);
    } else {
      handlePayConfirmed(order);
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

  const cancelOrderForModal = cancelTarget
    ? orders.find((o) => o.id === cancelTarget)
    : null;

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

  const payTargetOtherCount = payTarget ? getGroupUnpaidOrders(payTarget).length : 0;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <ConfirmModal
        open={!!payTarget}
        title="Konfirmasi Pembayaran"
        message={`Pesanan ini bagian dari checkout multi-penjual. Membayar akan menyelesaikan ${payTargetOtherCount + 1} pesanan sekaligus. Lanjutkan?`}
        confirmLabel="Bayar Sekarang"
        onConfirm={() => handlePayConfirmed(payTarget)}
        onCancel={() => setPayTarget(null)}
      />
      <ConfirmModal
        open={!!cancelTarget}
        title="Batalkan Pesanan"
        message={
          cancelOrderForModal?.checkoutGroupId
            ? 'Pesanan ini bagian dari checkout multi-penjual. Hanya pesanan ini yang dibatalkan; pesanan lain dalam grup checkout tetap aktif. Lanjutkan?'
            : 'Apakah Anda yakin ingin membatalkan pesanan ini?'
        }
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
