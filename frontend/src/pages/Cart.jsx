import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, Store } from 'lucide-react';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import SelectionCheckbox from '../components/common/SelectionCheckbox';
import { getCart, updateCartItem, updateCartSelection, removeCartItem } from '../services/cart';
import { toast } from '../store/useToastStore';
import { formatPrice } from '../utils/formatters';
import { resolveMediaUrl } from '../utils/media';
import { groupCartItemsBySeller } from '../utils/orderFees';
import Breadcrumb from '../components/common/Breadcrumb';
import { homeTrail, CRUMBS } from '../utils/breadcrumbs';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingSelection, setUpdatingSelection] = useState(false);

  const loadCart = () =>
    getCart()
      .then(({ data }) => setCart(data.data))
      .catch(console.error);

  useEffect(() => {
    loadCart().finally(() => setLoading(false));
  }, []);

  const allSelected = useMemo(
    () => cart?.items?.length > 0 && cart.items.every((item) => item.selected),
    [cart],
  );

  const someSelected = useMemo(
    () => cart?.items?.some((item) => item.selected) ?? false,
    [cart],
  );

  const sellerGroups = useMemo(
    () => (cart?.items ? groupCartItemsBySeller(cart.items) : []),
    [cart],
  );

  const selectedSellerCount = useMemo(() => {
    const selected = cart?.items?.filter((item) => item.selected) ?? [];
    return groupCartItemsBySeller(selected).length;
  }, [cart]);

  const handleUpdate = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(itemId, { quantity });
      await loadCart();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal update keranjang');
    }
  };

  const handleRemove = async (itemId) => {
    await removeCartItem(itemId);
    await loadCart();
  };

  const handleToggleItem = async (itemId, selected) => {
    try {
      setUpdatingSelection(true);
      await updateCartItem(itemId, { selected });
      await loadCart();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui pilihan');
    } finally {
      setUpdatingSelection(false);
    }
  };

  const handleToggleAll = async (selected) => {
    try {
      setUpdatingSelection(true);
      const { data } = await updateCartSelection({ selectAll: true, selected });
      setCart(data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal memperbarui pilihan');
    } finally {
      setUpdatingSelection(false);
    }
  };

  const handleCheckout = () => {
    if (!someSelected) {
      toast.error('Pilih minimal satu produk untuk checkout');
      return;
    }
    navigate('/checkout');
  };

  if (loading) return <Loading />;

  if (!cart?.items?.length) {
    return (
      <div className="max-w-content mx-auto px-4 py-8">
        <Breadcrumb items={homeTrail(CRUMBS.books, CRUMBS.cart)} />
        <EmptyState
          icon={ShoppingCart}
          title="Keranjang Kosong"
          description="Belum ada buku di keranjang. Jelajahi katalog dan temukan buku favorit Anda."
          cta="Jelajahi Katalog"
          to="/catalog"
        />
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <Breadcrumb items={homeTrail(CRUMBS.books, CRUMBS.cart)} />
      <h1 className="text-2xl font-bold text-heading mb-6">Keranjang Belanja</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 ${
              allSelected
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
            }`}
          >
            <SelectionCheckbox
              checked={allSelected}
              indeterminate={someSelected && !allSelected}
              onChange={handleToggleAll}
              disabled={updatingSelection}
              label="Pilih semua"
            />
            <span className="text-sm font-semibold text-heading">Pilih Semua</span>
            {someSelected && (
              <span className="text-xs text-primary font-medium ml-auto">
                {cart.selectedItemCount} dipilih
              </span>
            )}
          </div>

          {sellerGroups.map((group) => (
            <div key={group.sellerId} className="space-y-3">
              <div className="flex items-center gap-2 px-1">
                <Store size={16} className="text-primary shrink-0" />
                {group.seller?.id ? (
                  <Link
                    to={`/toko/${group.seller.id}`}
                    className="text-sm font-semibold text-heading hover:text-primary truncate"
                  >
                    {group.seller.fullName}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-heading">Toko</span>
                )}
              </div>

              {group.items.map((item) => {
            const isSelected = item.selected ?? true;

            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => !updatingSelection && handleToggleItem(item.id, !isSelected)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (!updatingSelection) handleToggleItem(item.id, !isSelected);
                  }
                }}
                className={`rounded-xl p-4 flex gap-4 cursor-pointer transition-all duration-200 border-2 bg-white dark:bg-gray-900 ${
                  isSelected
                    ? 'border-primary bg-primary/[0.04] shadow-sm shadow-primary/10'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <img
                  src={resolveMediaUrl(item.product.images?.[0], 'https://picsum.photos/100/120')}
                  alt={item.product.title}
                  className="w-24 h-28 object-cover rounded-lg shrink-0 pointer-events-none"
                />
                <div className="flex-1 min-w-0 pointer-events-none">
                  <h3 className="font-medium text-heading truncate">{item.product.title}</h3>
                  {item.product.seller?.id ? (
                    <Link
                      to={`/toko/${item.product.seller.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-xs text-subtle hover:text-primary mt-0.5 pointer-events-auto max-w-full"
                    >
                      <Store size={12} className="shrink-0" />
                      <span className="truncate">{item.product.seller.fullName}</span>
                    </Link>
                  ) : (
                    <p className="text-xs text-subtle mt-0.5">Toko</p>
                  )}
                  <p className="text-primary font-bold mt-1">{formatPrice(item.product.price)}</p>
                  <p className="text-sm text-muted mt-0.5">
                    Subtotal:{' '}
                    <span className="font-semibold">
                      {formatPrice(item.product.price * item.quantity)}
                    </span>
                  </p>

                  <div className="flex items-center gap-3 mt-3 pointer-events-auto">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(item.id, item.quantity - 1);
                        }}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        aria-label="Kurangi jumlah"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdate(item.id, item.quantity + 1);
                        }}
                        className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        aria-label="Tambah jumlah"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between gap-3 shrink-0">
                  <SelectionCheckbox
                    checked={isSelected}
                    onChange={(next) => handleToggleItem(item.id, next)}
                    disabled={updatingSelection}
                    label={`Pilih ${item.product.title}`}
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(item.id);
                    }}
                    className="btn-danger btn-sm pointer-events-auto"
                    aria-label="Hapus item"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            );
          })}
            </div>
          ))}
        </div>

        <div className="surface-card p-6 h-fit lg:sticky lg:top-24 rounded-2xl border-2 border-gray-200 dark:border-gray-700">
          <h2 className="font-bold text-heading mb-4">Ringkasan</h2>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-muted">
              Subtotal ({cart.selectedItemCount} item dipilih)
            </span>
            <span className="font-bold text-heading">{formatPrice(cart.selectedSubtotal)}</span>
          </div>
          <p className="text-xs text-subtle border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            {selectedSellerCount > 1
              ? `${selectedSellerCount} pesanan terpisah (per toko) — ongkir dihitung per toko di checkout`
              : 'Ongkos kirim dihitung di checkout'}
          </p>
          <button
            type="button"
            onClick={handleCheckout}
            disabled={!someSelected || updatingSelection}
            className="btn-primary w-full py-3 mt-4 disabled:opacity-50"
          >
            Checkout ({cart.selectedItemCount})
          </button>
        </div>
      </div>
    </div>
  );
}
