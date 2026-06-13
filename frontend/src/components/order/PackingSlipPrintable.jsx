import { Printer } from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import ProductSpecsTable from '../product/ProductSpecsTable';
import { hasShippingSpecs } from '../../utils/productSpecs';

export default function PackingSlipPrintable({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const items = order.items || [];

  return (
    <div className="invoice-printable">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 no-print">
        <h2 className="font-semibold text-heading">Label Pengiriman</h2>
        <div className="flex gap-2">
          {onClose && (
            <button type="button" onClick={onClose} className="btn-outline text-sm px-3 py-1.5">
              Tutup
            </button>
          )}
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 border border-primary text-primary px-4 py-2 rounded-lg text-sm hover:bg-primary/5"
          >
            <Printer size={16} />
            Cetak Label
          </button>
        </div>
      </div>

      <div className="surface-card p-6 print-invoice">
        <div className="flex justify-between items-start border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
          <div>
            <h3 className="text-xl font-bold text-primary">ReBook</h3>
            <p className="text-sm text-subtle">Label Pengiriman Paket</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold text-heading">Pesanan #{order.orderId}</p>
            <p className="text-subtle">{formatDate(order.createdAt)}</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-6 text-sm">
          <div>
            <p className="font-medium text-heading mb-1">Kirim Ke</p>
            <p className="font-semibold text-heading">{order.buyer?.fullName}</p>
            {order.buyer?.phoneNumber && (
              <p className="text-muted">Tel: {order.buyer.phoneNumber}</p>
            )}
            <p className="text-muted mt-1">{order.shippingAddress}</p>
            <p className="text-subtle">
              {order.shippingCity}, {order.shippingProvince}
            </p>
          </div>
          {order.trackingNumber && (
            <div>
              <p className="font-medium text-heading mb-1">Nomor Resi</p>
              <p className="text-lg font-bold text-primary">{order.trackingNumber}</p>
            </div>
          )}
        </div>

        <p className="text-sm font-medium text-heading mb-2">Isi Paket</p>
        <ul className="text-sm text-muted space-y-1 mb-4 list-disc list-inside">
          {items.map((item) => (
            <li key={item.id || item.product.id}>
              {item.product.title} &times; {item.quantity}
            </li>
          ))}
        </ul>

        {items.some((item) => hasShippingSpecs(item.product)) && (
          <div className="mb-4">
            <p className="text-sm font-medium text-heading mb-2">Spesifikasi Paket</p>
            <div className="space-y-3">
              {items.map((item) => (
                hasShippingSpecs(item.product) && (
                  <div key={`spec-${item.product.id}`}>
                    {items.length > 1 && (
                      <p className="text-xs font-medium text-subtle mb-1">{item.product.title}</p>
                    )}
                    <ProductSpecsTable product={item.product} variant="shipping" />
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        <p className="text-xs text-subtle mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-4">
          Tempelkan label ini pada paket. Pastikan alamat dan nomor resi terbaca jelas.
        </p>
      </div>
    </div>
  );
}
