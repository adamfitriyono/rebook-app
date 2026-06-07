import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductGrid from '../components/product/ProductGrid';
import CategoryFilter from '../components/product/CategoryFilter';
import Loading from '../components/common/Loading';
import { getProducts } from '../services/products';
import { CONDITION_LABELS } from '../utils/constants';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const condition = searchParams.get('condition') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    fetchProducts();
  }, [searchParams]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await getProducts({
        search: search || undefined,
        category: category || undefined,
        condition: condition || undefined,
        sort,
        page,
        limit: 20,
      });
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="max-w-content mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-heading mb-6">Katalog Buku</h1>

      <div className="grid lg:grid-cols-4 gap-6">
        <aside className="lg:col-span-1 space-y-4">
          <div className="surface-card p-4">
            <h3 className="font-semibold text-heading mb-3">Filter</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted block mb-1">Kondisi</label>
                <select
                  value={condition}
                  onChange={(e) => updateParam('condition', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="">Semua</option>
                  {Object.entries(CONDITION_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm text-muted block mb-1">Urutkan</label>
                <select
                  value={sort}
                  onChange={(e) => updateParam('sort', e.target.value)}
                  className="input-field text-sm"
                >
                  <option value="newest">Terbaru</option>
                  <option value="price_asc">Harga: Rendah ke Tinggi</option>
                  <option value="price_desc">Harga: Tinggi ke Rendah</option>
                  <option value="rating">Rating Tertinggi</option>
                </select>
              </div>
            </div>
          </div>
        </aside>

        <div className="lg:col-span-3">
          <CategoryFilter selected={category} onSelect={(c) => updateParam('category', c)} />
          {search && <p className="text-sm text-subtle mb-4">Hasil pencarian: &quot;{search}&quot;</p>}
          {loading ? <Loading /> : <ProductGrid products={products} />}

          {pagination.pages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => updateParam('page', String(p))}
                  className={`px-3 py-1 rounded ${p === page ? 'bg-primary text-white' : 'filter-pill-inactive'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
