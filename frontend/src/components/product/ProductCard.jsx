import { Link, useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import { resolveMediaUrl } from '../../utils/media';
import { isProductSoldOut } from '../../utils/productStatus';
import DiscountBadge from './DiscountBadge';
import SoldBadge from './SoldBadge';
import WishlistButton from './WishlistButton';
import VerifiedSellerBadge from './VerifiedSellerBadge';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const imageUrl = resolveMediaUrl(product.images?.[0], 'https://picsum.photos/400/533', { width: 400 });
  const soldOut = isProductSoldOut(product);

  const handleSellerClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.seller?.id) navigate(`/toko/${product.seller.id}`);
  };

  return (
    <Link to={`/product/${product.id}`} className="surface-card overflow-hidden hover:shadow-md dark:hover:shadow-gray-900/50 transition group block">
      <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <DiscountBadge percent={product.discountPercent} />
        <WishlistButton
          productId={product.id}
          className="absolute bottom-2 right-2 z-10 bg-white/90 dark:bg-gray-900/90 shadow-sm"
        />
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          decoding="async"
          className={`w-full h-full object-cover transition duration-300 ${soldOut ? 'opacity-80' : 'group-hover:scale-105'}`}
        />
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
            <span className="inline-flex items-center gap-1 max-w-full">
              <span className="truncate">{product.seller.fullName || 'Toko'}</span>
              <VerifiedSellerBadge verified={product.seller.verified} showLabel={false} size={12} />
            </span>
          </button>
        ) : (
          <p className="text-xs text-subtle truncate">Toko</p>
        )}
      </div>
    </Link>
  );
}
