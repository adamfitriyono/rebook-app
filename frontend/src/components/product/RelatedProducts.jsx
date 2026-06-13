import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import ProductGrid from './ProductGrid';
import Loading from '../common/Loading';
import { getProducts } from '../../services/products';

const MAX_ITEMS = 8;

export default function RelatedProducts({ category, excludeProductId }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    getProducts({ category, limit: 9, sort: 'newest' })
      .then(({ data }) => {
        const filtered = (data.data || [])
          .filter((p) => p.id !== excludeProductId)
          .slice(0, MAX_ITEMS);
        setProducts(filtered);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category, excludeProductId]);

  if (!category) return null;
  if (!loading && products.length === 0) return null;

  return (
    <section className="mt-8 surface-card p-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3 min-w-0">
          <h2 className="text-xl font-bold text-heading shrink-0">Buku Lainnya</h2>
          <span className="text-xs font-medium text-primary bg-primary/10 px-2.5 py-1 rounded-full truncate">
            {category}
          </span>
        </div>
        <Link
          to={`/catalog?category=${encodeURIComponent(category)}`}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline shrink-0"
        >
          Lihat semua
          <ChevronRight size={16} />
        </Link>
      </div>

      {loading ? (
        <div className="py-8">
          <Loading />
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </section>
  );
}
