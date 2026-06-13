import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { CreditCard, Package, MapPin, Truck } from 'lucide-react';
import Loading from '../components/common/Loading';
import BackButton from '../components/common/BackButton';
import ConfirmModal from '../components/common/ConfirmModal';
import OrderStatusTracker from '../components/order/OrderStatusTracker';
import InvoicePrintable from '../components/order/InvoicePrintable';
import { getOrderById, confirmOrder, cancelOrder } from '../services/orders';
import { processPayment } from '../services/payments';
import { toast } from '../store/useToastStore';
import { formatPrice, formatDate } from '../utils/formatters';
import { resolveMediaUrl } from '../utils/media';
import {
  getOrderProductTitle,
  canCancelOrder,
  canConfirmReceived,
  canPayOrder,
} from '../utils/orderHelpers';
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { formatPaymentMethod } from '../utils/paymentMethods';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const loadOrder = useCallback(() => {
    setLoading(true);
    getOrderById(id)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => {
        toast.error(err.response?.data?.error || 'Pesanan tidak ditemukan');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    if (order && location.state?.printInvoice && order.paymentStatus === 'paid') {
      window.setTimeout(() => window.print(), 500);
    }
  }, [order, location.state]);

  const handlePay = async () => {
    try {
      setActionLoading(true);
      await processPayment({
        orderId: order.id,
        amount: order.totalPrice,
        paymentMethod: 'qris',
      });
      toast.success('Pembayaran berhasil!');
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Pembayaran gagal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      setActionLoading(true);
      await cancelOrder(order.id);
      toast.success('Pesanan dibatalkan');
      setShowCancelModal(false);
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal membatalkan pesanan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setActionLoading(true);
      await confirmOrder(order.id);
      toast.success('Pesanan dikonfirmasi diterima');
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal konfirmasi pesanan');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!order) {
    return (
      <div className="max-w-content mx-auto px-4 py-16 text-center">
        <p className="text-subtle">Pesanan tidak ditemukan.</p>
        <Link to="/orders" className="text-primary hover:underline mt-4 inline-block">Kembali ke Riwayat</Link>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <ConfirmModal
        open={showCancelModal}
        title="Batalkan Pesanan"
        message="Apakah Anda yakin ingin membatalkan pesanan ini?"
        confirmLabel="Batalkan"
        danger
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />

      <BackButton to="/orders" label="Riwayat Pesanan" className="mb-4" />

      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-heading">{getOrderProductTitle(order)}</h1>
          <p className="text-sm text-subtle mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <span className="text-sm bg-primary/10 text-primary px-3 py-1 rounded-lg">
          {ORDER_STATUS_LABELS[order.status] || order.status}
        </span>
      </div>

      <div className="surface-card p-6 mb-6">
        <h2 className="font-semibold mb-4">Lacak Pesanan</h2>
        <OrderStatusTracker status={order.status} />
        {order.trackingNumber && ['shipped', 'delivered'].includes(order.status) && (
          <div className="mt-4 flex items-center gap-2 text-sm bg-primary/10 text-primary px-4 py-3 rounded-lg">
            <Truck size={18} />
            <span>
              Nomor Resi: <strong>{order.trackingNumber}</strong>
            </span>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="surface-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Package size={18} /> Item Pesanan
          </h2>
          <div className="space-y-4">
            {order.items.map((item) => {
              const canReviewItem = ['delivered', 'completed'].includes(order.status);
              return (
                <div key={item.product.id} className="flex gap-3 items-start p-2 -mx-2 rounded-lg">
                  <Link to={`/product/${item.product.id}`} className="flex gap-3 flex-1 min-w-0 hover:opacity-90">
                    <img
                      src={resolveMediaUrl(item.product.images?.[0], 'https://picsum.photos/80/100')}
                      alt={item.product.title}
                      className="w-16 h-20 object-cover rounded shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{item.product.title}</p>
                      <p className="text-sm text-subtle">Qty: {item.quantity}</p>
                      <p className="text-primary font-bold text-sm">
                        {formatPrice(item.priceAtTime * item.quantity)}
                      </p>
                    </div>
                  </Link>
                  {canReviewItem && (
                    <Link
                      to={`/product/${item.product.id}#ulasan`}
                      className="shrink-0 text-xs font-medium text-primary border border-primary px-3 py-1.5 rounded-lg hover:bg-primary/5 self-center"
                    >
                      Beri Ulasan
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface-card p-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <MapPin size={18} /> Pengiriman
            </h2>
            <p className="text-sm text-muted">{order.shippingAddress}</p>
            <p className="text-sm text-subtle mt-1">
              {order.shippingCity}, {order.shippingProvince}
            </p>
          </div>

          {order.transaction && (
            <div className="surface-card p-6">
              <h2 className="font-semibold mb-3 flex items-center gap-2">
                <CreditCard size={18} /> Pembayaran
              </h2>
              <div className="text-sm space-y-1 text-muted">
                <p>ID: {order.transaction.transactionId}</p>
                <p>Metode: {formatPaymentMethod(order.transaction.paymentMethod)}</p>
                <p>Jumlah: {formatPrice(order.transaction.amount)}</p>
                <p>Status: {order.transaction.status}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <InvoicePrintable order={order} />
      </div>

      <div className="flex flex-wrap gap-3">
        {canPayOrder(order) && (
          <button
            type="button"
            onClick={handlePay}
            disabled={actionLoading}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            Bayar Sekarang
          </button>
        )}
        {canCancelOrder(order) && (
          <button
            type="button"
            onClick={() => setShowCancelModal(true)}
            disabled={actionLoading}
            className="border border-red-500 text-red-500 px-6 py-2.5 rounded-lg hover:bg-red-50 disabled:opacity-50"
          >
            Batalkan Pesanan
          </button>
        )}
        {canConfirmReceived(order) && (
          <button
            type="button"
            onClick={handleConfirm}
            disabled={actionLoading}
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            Konfirmasi Diterima
          </button>
        )}
      </div>
    </div>
  );
}
