import { formatPrice } from '../../utils/formatters';

export default function CheckoutOrderSummary({
  breakdown,
  loading,
  disabled,
  onSubmit,
}) {
  const itemLabel = breakdown.itemCount === 1 ? '1 Barang' : `${breakdown.itemCount} Barang`;
  const hasMultipleSellers = breakdown.sellerCount > 1;

  return (
    <div className="space-y-4">
      {hasMultipleSellers && (
        <p className="text-xs text-primary font-medium bg-primary/10 px-3 py-2 rounded-lg">
          {breakdown.sellerCount} pesanan terpisah (per toko)
        </p>
      )}

      {breakdown.groups?.map((group) => (
        <div key={group.sellerId} className="text-sm border-b border-gray-100 dark:border-gray-800 pb-3 last:border-0">
          <p className="font-medium text-heading mb-2 truncate">
            {group.seller?.fullName || 'Toko'}
          </p>
          <div className="space-y-1 text-xs text-muted">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatPrice(group.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Biaya layanan</span>
              <span>{formatPrice(group.serviceFee)}</span>
            </div>
            <div className="flex justify-between">
              <span>Ongkir</span>
              <span>{formatPrice(group.shippingFee)}</span>
            </div>
          </div>
        </div>
      ))}

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Total Harga ({itemLabel})</span>
          <span className="font-medium text-heading">{formatPrice(breakdown.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Total Biaya Layanan</span>
          <span className="font-medium text-heading">{formatPrice(breakdown.serviceFee)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted">Total Ongkos Kirim</span>
          <span className="font-medium text-heading">{formatPrice(breakdown.shippingFee)}</span>
        </div>
        <div className="flex justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
          <span className="font-bold text-heading">Total Tagihan</span>
          <span className="font-bold text-primary text-lg">{formatPrice(breakdown.grandTotal)}</span>
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
