import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Package, MapPin, Truck } from 'lucide-react';
import Loading from '../components/common/Loading';
import Breadcrumb from '../components/common/Breadcrumb';
import { ordersTrail } from '../utils/breadcrumbs';
import ConfirmModal from '../components/common/ConfirmModal';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import OrderStatusTracker from '../components/order/OrderStatusTracker';
import InvoicePrintable from '../components/order/InvoicePrintable';
import { getOrderById, confirmOrder, cancelOrder } from '../services/orders';
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
import { ORDER_STATUS_LABELS } from '../utils/constants';
import { formatPaymentMethod } from '../utils/paymentMethods';
import { createDispute, getMyDisputes } from '../services/disputes';

export default function OrderDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fetchCart = useCartStore((s) => s.fetchCart);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [retryPayMethod, setRetryPayMethod] = useState('qris');
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);
  const [hasExistingDispute, setHasExistingDispute] = useState(false);

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
    if (!id) return;
    getMyDisputes()
      .then(({ data }) => {
        const found = (data.data || []).some((d) => d.orderId === parseInt(id, 10));
        setHasExistingDispute(found);
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (order && location.state?.printInvoice && order.paymentStatus === 'paid') {
      window.setTimeout(() => window.print(), 500);
    }
  }, [order, location.state]);

  const handlePayConfirmed = async () => {
    if (!retryPayMethod) {
      toast.error('Pilih metode pembayaran terlebih dahulu');
      return;
    }
    setShowPayModal(false);
    try {
      setActionLoading(true);
      if (order.checkoutGroupId) {
        await processCheckoutPayment({
          checkoutGroupId: order.checkoutGroupId,
          paymentMethod: retryPayMethod,
        });
      } else {
        await processPayment({
          orderId: order.id,
          amount: order.totalPrice,
          paymentMethod: retryPayMethod,
        });
      }
      toast.success('Pembayaran berhasil!');
      await fetchCart();
      loadOrder();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Pembayaran gagal');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePay = () => {
    setRetryPayMethod('qris');
    setShowPayModal(true);
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

  const handleSubmitDispute = async (e) => {
    e.preventDefault();
    if (!disputeSubject.trim() || !disputeDescription.trim()) return;
    try {
      setDisputeLoading(true);
      await createDispute({
        orderId: order.id,
        subject: disputeSubject.trim(),
        description: disputeDescription.trim(),
      });
      toast.success('Pengaduan diajukan. Tim support akan meninjau.');
      setDisputeSubject('');
      setDisputeDescription('');
      setHasExistingDispute(true);
      navigate('/pengaduan');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengajukan dispute');
    } finally {
      setDisputeLoading(false);
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
        open={showPayModal}
        title="Pilih Metode Pembayaran"
        message={
          <PaymentMethodSelector
            value={retryPayMethod}
            onChange={setRetryPayMethod}
          />
        }
        confirmLabel="Bayar Sekarang"
        onConfirm={handlePayConfirmed}
        onCancel={() => setShowPayModal(false)}
      />
      <ConfirmModal
        open={showCancelModal}
        title="Batalkan Pesanan"
        message={
          order.checkoutGroupId
            ? 'Pesanan ini bagian dari checkout multi-penjual. Hanya pesanan ini yang dibatalkan; pesanan lain dalam grup checkout tetap aktif. Lanjutkan?'
            : 'Apakah Anda yakin ingin membatalkan pesanan ini?'
        }
        confirmLabel="Batalkan"
        danger
        onConfirm={handleCancel}
        onCancel={() => setShowCancelModal(false)}
      />

      <Breadcrumb items={ordersTrail(`Pesanan #${order.id}`)} />

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
        {order.trackingNumber && ['shipped', 'delivered', 'completed'].includes(order.status) && (
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

      {['paid', 'shipped', 'delivered', 'completed'].includes(order.status) && (
        <div className="surface-card p-6 mb-6">
          <h2 className="font-semibold mb-3">Ajukan Pengaduan</h2>
          {hasExistingDispute ? (
            <p className="text-sm text-subtle">
              Pengaduan untuk pesanan ini sudah diajukan.{' '}
              <a href="/pengaduan" className="text-primary hover:underline">Lihat pengaduan saya</a>.
            </p>
          ) : (
            <>
              <p className="text-sm text-subtle mb-4">
                Ada masalah dengan pesanan ini? Ajukan pengaduan dan tim admin akan meninjau.
              </p>
              <form onSubmit={handleSubmitDispute} className="space-y-3 max-w-lg">
                <input
                  type="text"
                  value={disputeSubject}
                  onChange={(e) => setDisputeSubject(e.target.value)}
                  placeholder="Subjek (mis. Buku tidak sesuai)"
                  className="input-field"
                  required
                />
                <textarea
                  value={disputeDescription}
                  onChange={(e) => setDisputeDescription(e.target.value)}
                  placeholder="Jelaskan masalah secara detail..."
                  className="input-field min-h-[100px]"
                  required
                />
                <button type="submit" disabled={disputeLoading} className="btn-primary">
                  {disputeLoading ? 'Mengirim...' : 'Ajukan Pengaduan'}
                </button>
              </form>
            </>
          )}
        </div>
      )}

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
