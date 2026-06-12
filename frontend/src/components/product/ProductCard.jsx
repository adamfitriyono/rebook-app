import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/media';
import { isProductSoldOut } from '../../utils/productStatus';
import DiscountBadge from './DiscountBadge';
import SoldBadge from './SoldBadge';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const imageUrl = resolveMediaUrl(product.images?.[0], 'https://picsum.photos/400/533');
  const soldOut = isProductSoldOut(product);

  const handleSellerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.seller?.id) navigate(`/toko/${product.seller.id}`);
  };

  return (
    <Link to={`/product/${product.id}`} className="surface-card overflow-hidden hover:shadow-md dark:hover:shadow-gray-900/50 transition group block">
      <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <img
          src={imageUrl}
          alt={product.title}
          className={`w-full h-full object-cover transition duration-300 ${soldOut ? 'opacity-80' : 'group-hover:scale-105'}`}
        />
        <DiscountBadge percent={product.discountPercent} />
        {soldOut && <SoldBadge />}
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
