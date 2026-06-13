import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Star } from 'lucide-react';
import ProductGrid from '../components/product/ProductGrid';
import Loading from '../components/common/Loading';
import VerifiedSellerBadge from '../components/product/VerifiedSellerBadge';
import { getSellerProfile, getSellerProducts } from '../services/sellers';
import { resolveAvatarUrl } from '../utils/media';
import BackButton from '../components/common/BackButton';

const STATUS_TABS = [
  { key: 'all', label: 'Semua' },
  { key: 'available', label: 'Tersedia' },
  { key: 'sold_out', label: 'Terjual' },
];

export default function SellerStore() {
  const { sellerId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });

  const status = searchParams.get('status') || 'all';
  const page = parseInt(searchParams.get('page') || '1', 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [profileRes, productsRes] = await Promise.all([
          getSellerProfile(sellerId),
          getSellerProducts(sellerId, { status, page, limit: 20 }),
        ]);
        setProfile(profileRes.data.data);
        setProducts(productsRes.data.data);
        setPagination(productsRes.data.pagination);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sellerId, status, page]);

  const setStatus = (key) => {
    const params = new URLSearchParams(searchParams);
    params.set('status', key);
    params.delete('page');
    setSearchParams(params);
  };

  if (loading && !profile) return <Loading />;
  if (!profile) return <div className="text-center py-16">Toko tidak ditemukan</div>;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <BackButton fallback="/catalog" className="mb-4" />
      <div className="surface-card p-6 mb-6">
        <div className="flex items-center gap-4">
          <img
            src={resolveAvatarUrl(profile.profileImage)}
            alt={profile.fullName}
            className="w-16 h-16 rounded-full object-cover bg-gray-100 dark:bg-gray-700"
          />
          <div>
            <h1 className="text-2xl font-bold text-heading inline-flex items-center gap-2 flex-wrap">
              {profile.fullName}
              <VerifiedSellerBadge verified={profile.verified} />
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted mt-1">
              {profile.city && <span>{profile.city}</span>}
              <span className="flex items-center gap-1">
                <Star size={14} className="fill-yellow-400 text-yellow-400" />
                {profile.rating || 0}
              </span>
            </div>
            <p className="text-sm text-subtle mt-1">
              {profile.totalProducts} produk · {profile.totalSold} terjual
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatus(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              status === tab.key ? 'bg-primary text-white' : 'filter-pill-inactive'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? <Loading /> : <ProductGrid products={products} />}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', String(p));
                setSearchParams(params);
              }}
              className={`px-3 py-1 rounded ${p === page ? 'bg-primary text-white' : 'filter-pill-inactive'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
