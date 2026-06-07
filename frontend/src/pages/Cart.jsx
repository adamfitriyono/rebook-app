import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Loading from '../components/common/Loading';
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
      <div className="max-w-content mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-heading mb-4">Keranjang Kosong</h1>
        <Link to="/catalog" className="text-primary hover:underline">Jelajahi katalog</Link>
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
                className="w-20 h-24 object-cover rounded"
              />
              <div className="flex-1">
                <h3 className="font-medium">{item.product.title}</h3>
                <p className="text-primary font-bold">{formatPrice(item.product.price)}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => handleUpdate(item.id, item.quantity - 1)}
                    className="w-8 h-8 border rounded"
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleUpdate(item.id, item.quantity + 1)}
                    className="w-8 h-8 border rounded"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.id)}
                    className="ml-auto text-red-500 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="surface-card p-6 h-fit">
          <h2 className="font-bold mb-4">Ringkasan</h2>
          <div className="flex justify-between mb-2">
            <span>Subtotal ({cart.itemCount} item)</span>
            <span className="font-bold">{formatPrice(cart.subtotal)}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="w-full bg-primary text-white py-3 rounded-lg mt-4 hover:bg-primary/90"
          >
            Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
