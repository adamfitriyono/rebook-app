import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle, Printer } from 'lucide-react';
import Loading from '../components/common/Loading';
import { getOrderById } from '../services/orders';
import { formatPrice } from '../utils/formatters';
import { getOrderProductTitle } from '../utils/orderHelpers';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then(({ data }) => setOrder(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!order) return <div className="text-center py-16">Pesanan tidak ditemukan</div>;

  return (
    <div className="max-w-content mx-auto px-4 py-16 text-center">
      <CheckCircle size={64} className="text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold text-heading mb-2">Pembayaran Berhasil!</h1>
      <p className="text-muted mb-2">{getOrderProductTitle(order)}</p>
      <p className="text-subtle text-sm mb-6">Pesanan Anda telah dibayar.</p>
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
