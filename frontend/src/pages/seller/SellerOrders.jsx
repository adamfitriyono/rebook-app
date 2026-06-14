import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ExternalLink, Printer, Package } from 'lucide-react';
import Loading from '../../components/common/Loading';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import StatusBadge from '../../components/common/StatusBadge';
import OrderStatusTracker from '../../components/order/OrderStatusTracker';
import PackingSlipPrintable from '../../components/order/PackingSlipPrintable';
import { getSellerOrders, updateOrderStatus } from '../../services/orders';
import { toast } from '../../store/useToastStore';
import { formatDate } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/media';
import { getOrderProductTitle, canMarkShipped } from '../../utils/orderHelpers';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [shipTarget, setShipTarget] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [printOrder, setPrintOrder] = useState(null);

  const fetchData = () => {
    setLoading(true);
    getSellerOrders()
      .then(({ data }) => setOrders(data.data))
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
        paymentStatus: item.order.paymentStatus,
        trackingNumber: item.order.trackingNumber,
        shippingAddress: item.order.shippingAddress,
        shippingCity: item.order.shippingCity,
        shippingProvince: item.order.shippingProvince,
        buyer: item.order.buyer,
        createdAt: item.order.createdAt,
        items: orders.filter((o) => o.order.id === item.order.id),
      });
    }
    return acc;
  }, []);

  const canPrintLabel = (order) =>
    order.paymentStatus === 'paid'
    && ['paid', 'shipped', 'delivered', 'completed'].includes(order.status);

  if (loading) return <Loading />;

  return (
    <div>
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

      {printOrder && (
        <div className="mb-8">
          <PackingSlipPrintable order={printOrder} onClose={() => setPrintOrder(null)} />
        </div>
      )}

      <h2 className="text-lg font-bold text-heading mb-4">Pesanan Masuk</h2>

      {uniqueOrders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Belum Ada Pesanan"
          description="Pesanan dari pembeli akan muncul di sini."
          cta="Kelola Listing"
          to="/seller/listings"
        />
      ) : (
        <div className="space-y-4">
          {uniqueOrders.map((order) => {
            const firstProduct = order.items[0]?.product;
            const thumb = firstProduct?.images?.[0];
            return (
              <div key={order.orderId} className="surface-card p-4 rounded-2xl">
                <div className="flex gap-4">
                  <img
                    src={resolveMediaUrl(thumb, 'https://picsum.photos/80/100', { width: 160 })}
                    alt=""
                    className="w-16 aspect-[3/4] object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-medium text-heading truncate">
                          {getOrderProductTitle({ items: order.items })}
                        </p>
                        <p className="text-sm text-subtle mt-0.5">
                          {order.buyer?.fullName} &middot; {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        {order.paymentStatus !== 'paid' && (
                          <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-lg">
                            Menunggu Pembayaran
                          </span>
                        )}
                        <StatusBadge status={order.status} />
                      </div>
                    </div>

                    <OrderStatusTracker status={order.status} compact />

                    <div className="mt-3 space-y-1">
                      {order.items.map((item) => (
                        <p key={item.id} className="text-sm text-muted">
                          {item.product.title} &times; {item.quantity}
                        </p>
                      ))}
                    </div>

                    {order.trackingNumber && (
                      <p className="text-sm text-primary mt-2">
                        Resi: <span className="font-medium">{order.trackingNumber}</span>
                      </p>
                    )}

                    <div className="flex flex-wrap gap-2 mt-4">
                      <Link to={`/seller/orders/${order.orderId}`} className="btn-outline btn-sm">
                        <ExternalLink size={14} />
                        Detail
                      </Link>
                      {canPrintLabel(order) && (
                        <button
                          type="button"
                          onClick={() => setPrintOrder(order)}
                          className="btn-outline btn-sm"
                        >
                          <Printer size={14} />
                          Cetak Label
                        </button>
                      )}
                      {canMarkShipped(order) && (
                        <button
                          type="button"
                          onClick={() => {
                            setShipTarget(order.orderId);
                            setTrackingNumber('');
                          }}
                          disabled={updatingId === order.orderId}
                          className="btn-primary btn-sm"
                        >
                          <Truck size={14} />
                          {updatingId === order.orderId ? 'Memproses...' : 'Tandai Dikirim'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
