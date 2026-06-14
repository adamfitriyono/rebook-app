import { useEffect, useState, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Package, MapPin, Truck } from 'lucide-react';
import Loading from '../../components/common/Loading';
import StatusBadge from '../../components/common/StatusBadge';
import OrderStatusTracker from '../../components/order/OrderStatusTracker';
import PackingSlipPrintable from '../../components/order/PackingSlipPrintable';
import { getOrderById } from '../../services/orders';
import { toast } from '../../store/useToastStore';
import { formatPrice, formatDate } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/media';
import { getOrderProductTitle } from '../../utils/orderHelpers';
import { createDispute } from '../../services/disputes';

export default function SellerOrderDetail() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [disputeSubject, setDisputeSubject] = useState('');
  const [disputeDescription, setDisputeDescription] = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);

  const loadOrder = useCallback(() => {
    setLoading(true);
    getOrderById(orderId)
      .then(({ data }) => setOrder(data.data))
      .catch((err) => {
        toast.error(err.response?.data?.error || 'Pesanan tidak ditemukan');
      })
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

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
      toast.success('Dispute diajukan. Tim support akan meninjau.');
      setDisputeSubject('');
      setDisputeDescription('');
      navigate('/disputes');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal mengajukan dispute');
    } finally {
      setDisputeLoading(false);
    }
  };

  if (loading) return <Loading />;
  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-subtle">Pesanan tidak ditemukan.</p>
        <Link to="/seller/orders" className="text-primary hover:underline mt-4 inline-block">
          Kembali ke Pesanan
        </Link>
      </div>
    );
  }

  const canPrintLabel =
    order.paymentStatus === 'paid'
    && ['paid', 'shipped', 'delivered', 'completed'].includes(order.status);

  const packingOrder = {
    orderId: order.id,
    status: order.status,
    shippingAddress: order.shippingAddress,
    shippingCity: order.shippingCity,
    shippingProvince: order.shippingProvince,
    buyer: order.buyer,
    trackingNumber: order.trackingNumber,
    createdAt: order.createdAt,
    items: order.items,
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-heading">{getOrderProductTitle(order)}</h2>
          <p className="text-sm text-subtle mt-1">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {order.paymentStatus !== 'paid' && (
            <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg">
              Menunggu Pembayaran
            </span>
          )}
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="surface-card p-6 mb-6">
        <h3 className="font-semibold mb-4">Status Pesanan</h3>
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
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Package size={18} /> Item Pesanan
          </h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.product.id} className="flex gap-3">
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
              </div>
            ))}
          </div>
          <div className="border-t mt-4 pt-4 flex justify-between font-bold">
            <span>Total</span>
            <span className="text-primary">{formatPrice(order.totalPrice)}</span>
          </div>
        </div>

        <div className="surface-card p-6">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <MapPin size={18} /> Pengiriman
          </h3>
          {order.buyer && (
            <p className="text-sm font-medium text-heading mb-1">{order.buyer.fullName}</p>
          )}
          {order.buyer?.phoneNumber && (
            <p className="text-sm text-muted mb-2">Tel: {order.buyer.phoneNumber}</p>
          )}
          <p className="text-sm text-muted">{order.shippingAddress}</p>
          <p className="text-sm text-subtle mt-1">
            {order.shippingCity}, {order.shippingProvince}
          </p>
        </div>
      </div>

      {canPrintLabel && (
        <div className="mb-6">
          <PackingSlipPrintable order={packingOrder} />
        </div>
      )}

      {['paid', 'shipped', 'delivered', 'completed'].includes(order.status) && (
        <div className="surface-card p-6 mb-6">
          <h3 className="font-semibold mb-3">Ajukan Dispute / Support</h3>
          <p className="text-sm text-subtle mb-4">
            Ada masalah dengan pesanan ini? Ajukan dispute dan tim admin akan meninjau.
          </p>
          <form onSubmit={handleSubmitDispute} className="space-y-3 max-w-lg">
            <input
              type="text"
              value={disputeSubject}
              onChange={(e) => setDisputeSubject(e.target.value)}
              placeholder="Subjek (mis. Pembayaran belum masuk)"
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
              {disputeLoading ? 'Mengirim...' : 'Ajukan Dispute'}
            </button>
          </form>
        </div>
      )}

      <Link to="/seller/orders" className="btn-outline btn-sm">
        Kembali ke Daftar Pesanan
      </Link>
    </div>
  );
}
