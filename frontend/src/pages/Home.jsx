import { useEffect, useState } from 'react';
import PromoBanner from '../components/common/PromoBanner';
import CategoryFilter from '../components/product/CategoryFilter';
import ProductGrid from '../components/product/ProductGrid';
import Loading from '../components/common/Loading';
import { getProducts } from '../services/products';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = { limit: 15, sort: 'newest' };
      if (category) params.category = category;
      const { data } = await getProducts(params);
      setProducts(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-content mx-auto px-4 py-6">
      <PromoBanner />
      <CategoryFilter selected={category} onSelect={setCategory} />
      {loading ? <Loading /> : <ProductGrid products={products} />}
    </div>
  );
}
