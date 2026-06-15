import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, UserPlus } from 'lucide-react';
import Loading from '../components/common/Loading';
import EmptyState from '../components/common/EmptyState';
import Breadcrumb from '../components/common/Breadcrumb';
import { homeTrail, CRUMBS } from '../utils/breadcrumbs';
import VerifiedSellerBadge from '../components/product/VerifiedSellerBadge';
import FollowStoreButton from '../components/seller/FollowStoreButton';
import { getFollowedSellers } from '../services/sellerFollows';
import { resolveAvatarUrl } from '../utils/media';
import { formatDate } from '../utils/formatters';

export default function FollowedStores() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStores = () => {
    setLoading(true);
    getFollowedSellers()
      .then(({ data }) => setStores(data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadStores();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="max-w-content mx-auto px-4 py-8">
      <Breadcrumb items={homeTrail(CRUMBS.profile, CRUMBS.followedStores)} />
      <h1 className="text-2xl font-bold text-heading mb-6">Toko Diikuti</h1>

      {stores.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="Belum Ada Toko Diikuti"
          description="Follow toko favoritmu untuk memantau produk baru dari penjual yang kamu percaya."
          cta="Jelajahi Katalog"
          to="/catalog"
        />
      ) : (
        <div className="space-y-4">
          {stores.map((item) => (
            <div key={item.id} className="surface-card p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link to={`/toko/${item.sellerId}`} className="flex items-center gap-3 min-w-0 flex-1">
                <img
                  src={resolveAvatarUrl(item.seller.profileImage)}
                  alt={item.seller.fullName}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover bg-gray-100 dark:bg-gray-700 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-heading leading-snug break-words">
                    {item.seller.fullName}
                  </p>
                  <div className="mt-1">
                    <VerifiedSellerBadge verified={item.seller.verified} size={14} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-subtle mt-2">
                    {item.seller.city && <span>{item.seller.city}</span>}
                    <span className="flex items-center gap-1">
                      <Star size={12} className="fill-yellow-400 text-yellow-400" />
                      {item.seller.rating || 0}
                    </span>
                    <span>· {item.seller.totalProducts} produk</span>
                  </div>
                  <p className="text-xs text-muted mt-1">Diikuti sejak {formatDate(item.createdAt)}</p>
                </div>
              </Link>
              <FollowStoreButton
                sellerId={item.sellerId}
                className="w-full sm:w-auto justify-center shrink-0"
                onToggle={(sellerId, following) => {
                  if (!following) {
                    setStores((prev) => prev.filter((s) => s.sellerId !== sellerId));
                  }
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
