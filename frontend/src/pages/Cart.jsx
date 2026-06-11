import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import { getCart, updateCartItem, removeCartItem } from '../services/cart';
import { toast } from '../store/useToastStore';
import { formatPrice } from '../utils/formatters';
import { resolveMediaUrl } from '../utils/media';

export default function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCart()
      .then(({ data }) => setCart(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(itemId, { quantity });
      const { data } = await getCart();
      setCart(data.data);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Gagal update keranjang');
    }
  };

  const handleRemove = async (itemId) => {
    await removeCartItem(itemId);
    const { data } = await getCart();
    setCart(data.data);
  };

  if (loading) return <Loading />;

  if (!cart?.items?.length) {
    return (
      <div className="max-w-content mx-auto px-4">
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
      <h1 className="text-2xl font-bold text-heading mb-6">Keranjang Belanja</h1>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="surface-card p-4 flex gap-4">
              <img
                src={resolveMediaUrl(item.product.images?.[0], 'https://picsum.photos/100/120')}
                alt={item.product.title}
                className="w-24 h-28 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-heading truncate">{item.product.title}</h3>
                <p className="text-primary font-bold mt-1">{formatPrice(item.product.price)}</p>
                <p className="text-sm text-muted mt-0.5">
                  Subtotal: <span className="font-semibold">{formatPrice(item.product.price * item.quantity)}</span>
                </p>

                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleUpdate(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      aria-label="Kurangi jumlah"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => handleUpdate(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      aria-label="Tambah jumlah"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="btn-danger btn-sm ml-auto"
                    aria-label="Hapus item"
                  >
                    <Trash2 size={14} />
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="surface-card p-6 h-fit lg:sticky lg:top-24 rounded-2xl">
          <h2 className="font-bold text-heading mb-4">Ringkasan</h2>
          <div className="flex justify-between mb-2 text-sm">
            <span className="text-muted">Subtotal ({cart.itemCount} item)</span>
            <span className="font-bold text-heading">{formatPrice(cart.subtotal)}</span>
          </div>
          <p className="text-xs text-subtle border-t border-gray-200 dark:border-gray-700 pt-3 mt-3">
            Ongkos kirim dihitung di checkout
          </p>
          <button type="button" onClick={() => navigate('/checkout')} className="btn-primary w-full py-3 mt-4">
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
