import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import ProductGrid from '../components/product/ProductGrid';
import BackButton from '../components/common/BackButton';
import { getWishlist } from '../services/wishlist';

export default function Wishlist() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    setLoading(true);
    getWishlist()
      .then(({ data }) => setProducts(data.data.map((item) => item.product)))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <BackButton fallback="/catalog" className="mb-4" />
      <h1 className="text-2xl font-bold text-heading mb-6">Wishlist Saya</h1>

      {products.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Wishlist Kosong"
          description="Simpan buku favorit dengan menekan ikon love di katalog atau halaman produk."
          cta="Jelajahi Katalog"
          to="/catalog"
        />
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
