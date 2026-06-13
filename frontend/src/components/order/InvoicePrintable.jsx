import { Printer } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils/formatters';
import { getOrderProductTitle } from '../../utils/orderHelpers';
import { formatPaymentMethod } from '../../utils/paymentMethods';

export default function InvoicePrintable({ order }) {
  if (!order || order.paymentStatus !== 'paid') return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="invoice-printable">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 no-print">
        <h2 className="font-semibold text-heading">Invoice / Bukti Pembayaran</h2>
        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg text-sm hover:bg-primary/5"
        >
          <Printer size={16} />
          Cetak / Download PDF
        </button>
      </div>

      <div className="surface-card p-6 print-invoice">
        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-primary">ReBook</h3>
            <p className="text-sm text-subtle">Buku Lama, Ilmu Baru</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-heading">INVOICE</p>
            <p className="text-muted">#{order.id}</p>
            <p className="text-subtle">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="font-medium text-heading mb-1">Pengiriman Ke</p>
            <p className="text-muted">{order.shippingAddress}</p>
            <p className="text-subtle">
              {order.shippingCity}, {order.shippingProvince}
            </p>
          </div>
          {order.transaction && (
            <div>
              <p className="font-medium text-heading mb-1">Pembayaran</p>
              <p className="text-muted">Metode: {formatPaymentMethod(order.transaction.paymentMethod)}</p>
              <p className="text-muted">ID Transaksi: {order.transaction.transactionId}</p>
              <p className="text-muted">Status: {order.transaction.status}</p>
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-heading mb-2">{getOrderProductTitle(order)}</p>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700 text-left text-muted">
              <th className="py-2 pr-2">Item</th>
              <th className="py-2 px-2 text-center">Qty</th>
              <th className="py-2 px-2 text-right">Harga</th>
              <th className="py-2 pl-2 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.product.id} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 pr-2">{item.product.title}</td>
                <td className="py-2 px-2 text-center">{item.quantity}</td>
                <td className="py-2 px-2 text-right">{formatPrice(item.priceAtTime)}</td>
                <td className="py-2 pl-2 text-right">{formatPrice(item.priceAtTime * item.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end">
          <div className="text-right">
            <p className="text-sm text-muted">Total Pembayaran</p>
            <p className="text-2xl font-bold text-primary">{formatPrice(order.totalPrice)}</p>
          </div>
        </div>

        {order.trackingNumber && (
          <p className="text-sm text-muted mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            Nomor Resi: <strong>{order.trackingNumber}</strong>
          </p>
        )}

        <p className="text-xs text-subtle mt-6 text-center">
          Terima kasih telah berbelanja di ReBook. Invoice ini sah sebagai bukti pembayaran.
        </p>
      </div>
    </div>
  );
}
