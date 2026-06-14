import { useCallback, useEffect, useState } from 'react';
import PromoBanner from '../components/common/PromoBanner';
import CategoryFilter from '../components/product/CategoryFilter';
import ProductGrid from '../components/product/ProductGrid';
import Loading from '../components/common/Loading';
import { getProducts } from '../services/products';

const PAGE_SIZE = 15;

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [category, setCategory] = useState('');

  const fetchProducts = useCallback(async (pageNum, replace = false) => {
    try {
      if (replace) setLoading(true);
      else setLoadingMore(true);

      const params = { limit: PAGE_SIZE, sort: 'newest', page: pageNum };
      if (category) params.category = category;

      const { data } = await getProducts(params);
      setProducts((prev) => (replace ? data.data : [...prev, ...data.data]));

      const { page: currentPage, pages } = data.pagination;
      setPage(currentPage);
      setHasMore(currentPage < pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [category]);

  useEffect(() => {
    setPage(1);
    fetchProducts(1, true);
  }, [fetchProducts]);

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    fetchProducts(page + 1, false);
  };

  return (
    <div className="max-w-content mx-auto px-4 py-6">
      <PromoBanner />
      <CategoryFilter selected={category} onSelect={setCategory} />
      {loading ? (
        <Loading />
      ) : (
        <>
          <ProductGrid products={products} />
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                type="button"
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="btn-outline min-w-[200px] disabled:opacity-50"
              >
                {loadingMore ? 'Memuat...' : 'Muat lebih banyak'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
