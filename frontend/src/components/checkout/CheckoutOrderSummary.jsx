import { formatPrice } from '../../utils/formatters';

export default function CheckoutOrderSummary({
  breakdown,
  loading,
  disabled,
  onSubmit,
}) {
  const itemLabel = breakdown.itemCount === 1 ? '1 Barang' : `${breakdown.itemCount} Barang`;

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Total Harga ({itemLabel})</span>
          <span className="font-medium text-heading">{formatPrice(breakdown.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Biaya Layanan</span>
          <span className="font-medium text-heading">{formatPrice(breakdown.serviceFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Ongkos Kirim</span>
          <span className="font-medium text-heading">{formatPrice(breakdown.shippingFee)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <span className="font-bold text-heading">Total Tagihan</span>
          <span className="font-bold text-primary text-lg">{formatPrice(breakdown.totalPrice)}</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading || disabled}
        className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary/90 disabled:opacity-50 font-medium"
      >
        {loading ? 'Memproses...' : 'Bayar Sekarang'}
      </button>
    </div>
  );
}
