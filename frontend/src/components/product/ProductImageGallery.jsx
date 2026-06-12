import { useState } from 'react';
import { resolveMediaUrl } from '../../utils/media';
import DiscountBadge from './DiscountBadge';

const FALLBACK = 'https://picsum.photos/400/400';

export default function ProductImageGallery({ images = [], alt = 'Produk', discountPercent }) {
  const urls = (images?.length ? images : [null]).map((img) => resolveMediaUrl(img, FALLBACK));
  const [activeIndex, setActiveIndex] = useState(0);
  const safeIndex = Math.min(activeIndex, urls.length - 1);

  return (
    <div className="w-full self-start md:sticky md:top-24">
      <div className="relative aspect-square w-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden">
        <img
          src={urls[safeIndex]}
          alt={alt}
          className="w-full h-full object-cover"
        />
        <DiscountBadge percent={discountPercent} />
      </div>

      {urls.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {urls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                index === safeIndex
                  ? 'border-primary'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
              aria-label={`Gambar ${index + 1}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
