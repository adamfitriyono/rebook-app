import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/media';
import DiscountBadge from './DiscountBadge';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const imageUrl = resolveMediaUrl(product.images?.[0], 'https://picsum.photos/400/500');

  const handleSellerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.seller?.id) navigate(`/toko/${product.seller.id}`);
  };

  return (
    <Link to={`/product/${product.id}`} className="surface-card overflow-hidden hover:shadow-md dark:hover:shadow-gray-900/50 transition group block">
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <DiscountBadge percent={product.discountPercent} />
      </div>
      <div className="p-3 space-y-1">
        <h3 className="font-medium text-sm text-heading line-clamp-2 min-h-[2.5rem]">{product.title}</h3>
        <p className="text-primary font-bold text-sm">{formatPrice(product.price)}</p>
        <div className="flex items-center gap-1 text-xs text-subtle">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span>{product.rating || 0}</span>
          <span>|</span>
          <span>Terjual {product.sold || 0}</span>
        </div>
        {product.seller?.id ? (
          <button
            type="button"
            onClick={handleSellerClick}
            className="text-xs text-subtle truncate hover:text-primary hover:underline block text-left w-full"
          >
            {product.seller.fullName || 'Toko'}
          </button>
        ) : (
          <p className="text-xs text-subtle truncate">Toko</p>
        )}
      </div>
    </Link>
  );
}
