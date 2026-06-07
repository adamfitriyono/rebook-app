import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Loading from '../components/common/Loading';
import ConfirmModal from '../components/common/ConfirmModal';
import OrderStatusTracker from '../components/order/OrderStatusTracker';
import { getOrders, confirmOrder, cancelOrder } from '../services/orders';
import { processPayment } from '../services/payments';
import { toast } from '../store/useToastStore';
import { formatPrice, formatDate } from '../utils/formatters';
import {
  getOrderProductTitle,
  canCancelOrder,
  canConfirmReceived,
  canPayOrder,
} from '../utils/orderHelpers';
import { ORDER_STATUS_LABELS, ORDER_STATUS_FILTERS } from '../utils/constants';

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
      await processPayment({
        orderId: order.id,
        amount: order.totalPrice,
        paymentMethod: 'midtrans',
      });
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

      <h1 className="text-2xl font-bold text-heading mb-6">Riwayat Pesanan</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {ORDER_STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setStatusFilter(f.value)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              statusFilter === f.value
                ? 'bg-primary text-white'
                : 'filter-pill-inactive'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <Loading />
      ) : orders.length === 0 ? (
        <p className="text-subtle">Belum ada pesanan.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="surface-card p-4">
              <div className="flex justify-between items-start mb-3 gap-3">
                <div className="min-w-0">
                  <p className="font-medium truncate">{getOrderProductTitle(order)}</p>
                  <p className="text-sm text-subtle">{formatDate(order.createdAt)}</p>
                </div>
                <span className="text-sm bg-primary/10 text-primary px-2 py-1 rounded shrink-0">
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>

              <OrderStatusTracker status={order.status} compact />

              <p className="font-bold text-primary mt-3">{formatPrice(order.totalPrice)}</p>
              <p className="text-sm text-muted mt-1">
                {order.items.length} item &middot; {order.shippingCity}
              </p>

              <div className="flex flex-wrap gap-2 mt-4">
                <Link
                  to={`/orders/${order.id}`}
                  className="text-sm text-primary hover:underline px-3 py-1.5 border border-primary rounded-lg"
                >
                  Detail
                </Link>
                {canPayOrder(order) && (
                  <button
                    type="button"
                    onClick={() => handlePay(order)}
                    disabled={actionId === order.id}
                    className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    Bayar
                  </button>
                )}
                {canCancelOrder(order) && (
                  <button
                    type="button"
                    onClick={() => setCancelTarget(order.id)}
                    disabled={actionId === order.id}
                    className="text-sm text-red-500 border border-red-500 px-3 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    Batalkan
                  </button>
                )}
                {canConfirmReceived(order) && (
                  <button
                    type="button"
                    onClick={() => handleConfirm(order.id)}
                    disabled={actionId === order.id}
                    className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                  >
                    Konfirmasi Diterima
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
