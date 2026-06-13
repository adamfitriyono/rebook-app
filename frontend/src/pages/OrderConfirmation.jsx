import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { CheckCircle, Printer } from 'lucide-react';
import Loading from '../components/common/Loading';
import { getOrderById, getOrdersByGroup } from '../services/orders';
import { formatPrice, formatDate } from '../utils/formatters';
import { getOrderProductTitle } from '../utils/orderHelpers';
import { formatPaymentMethod } from '../utils/paymentMethods';
import BackButton from '../components/common/BackButton';

export default function OrderConfirmation() {
  const { id, checkoutGroupId } = useParams();
  const location = useLocation();
  const isGroup = Boolean(checkoutGroupId);
  const [order, setOrder] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGroup) {
      getOrdersByGroup(checkoutGroupId)
        .then(({ data }) => setGroupData(data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      getOrderById(id)
        .then(({ data }) => setOrder(data.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id, checkoutGroupId, isGroup]);

  if (loading) return <Loading />;

  if (isGroup) {
    if (!groupData) return <div className="text-center py-16">Pesanan tidak ditemukan</div>;

    return (
      <div className="max-w-content mx-auto px-4 py-16">
        <BackButton to="/orders" label="Riwayat Pesanan" className="mb-6" />
        <div className="text-center mb-8">
          <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-heading mb-2">Pembayaran Berhasil!</h1>
          <p className="text-subtle text-sm mb-2">
            {groupData.orders.length} pesanan dari checkout yang sama
          </p>
          <p className="text-xl font-bold text-primary">
            {formatPrice(location.state?.grandTotal ?? groupData.grandTotal)}
          </p>
        </div>

        <div className="space-y-4 max-w-lg mx-auto">
          {groupData.orders.map((o) => (
            <div key={o.id} className="surface-card p-4">
              <div className="flex justify-between items-start gap-2 mb-2">
                <div>
                  <p className="font-semibold text-heading">
                    Pesanan #{o.id}
                    {o.seller?.fullName && (
                      <span className="text-subtle font-normal text-sm"> · {o.seller.fullName}</span>
                    )}
                  </p>
                  <p className="text-xs text-subtle">{formatDate(o.createdAt)}</p>
                </div>
                <span className="font-bold text-primary">{formatPrice(o.totalPrice)}</span>
              </div>
              <p className="text-sm text-muted mb-3">
                {o.items.map((i) => `${i.product.title} x${i.quantity}`).join(', ')}
              </p>
              <Link
                to={`/orders/${o.id}`}
                className="text-sm text-primary hover:underline"
              >
                Lihat detail pesanan
              </Link>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center flex-wrap mt-8">
          <Link to="/orders" className="px-6 py-2 bg-primary text-white rounded-lg">
            Riwayat Pesanan
          </Link>
          <Link to="/" className="px-6 py-2 border border-gray-300 dark:border-gray-600 btn-ghost rounded-lg">
            Beranda
          </Link>
        </div>
      </div>
    );
  }

  if (!order) return <div className="text-center py-16">Pesanan tidak ditemukan</div>;

  return (
    <div className="max-w-content mx-auto px-4 py-16 text-center">
      <BackButton to="/orders" label="Riwayat Pesanan" className="mb-6 mx-auto justify-center" />
      <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-heading mb-2">Pembayaran Berhasil!</h1>
      <p className="text-muted mb-2">{getOrderProductTitle(order)}</p>
      <p className="text-subtle text-sm mb-2">Pesanan Anda telah dibayar.</p>
      {order.transaction?.paymentMethod && (
        <p className="text-sm text-muted mb-4">
          Metode: {formatPaymentMethod(order.transaction.paymentMethod)}
        </p>
      )}
      <p className="text-xl font-bold text-primary mb-8">{formatPrice(order.totalPrice)}</p>
      <div className="flex gap-4 justify-center flex-wrap">
        {order.paymentStatus === 'paid' && (
          <Link
            to={`/orders/${order.id}`}
            state={{ printInvoice: true }}
            className="flex items-center gap-2 px-6 py-2 border border-primary text-primary rounded-lg"
          >
            <Printer size={16} />
            Lihat Invoice
          </Link>
        )}
        <Link to={`/orders/${order.id}`} className="px-6 py-2 bg-primary text-white rounded-lg">
          Lihat Detail Pesanan
        </Link>
        <Link to="/orders" className="px-6 py-2 border border-primary text-primary rounded-lg">
          Riwayat Pesanan
        </Link>
        <Link to="/" className="px-6 py-2 border border-gray-300 dark:border-gray-600 btn-ghost rounded-lg">
          Beranda
        </Link>
      </div>
    </div>
  );
}
