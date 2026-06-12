import { useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/media';
import DiscountBadge from './DiscountBadge';
import SoldBadge from './SoldBadge';
import ImageLightbox from './ImageLightbox';

const FALLBACK = 'https://picsum.photos/400/533';

export default function ProductImageGallery({
  images = [],
  alt = 'Produk',
  discountPercent,
  soldOut = false,
}) {
  const urls = (images?.length ? images : [null]).map((img) => resolveMediaUrl(img, FALLBACK));
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const safeIndex = Math.min(activeIndex, urls.length - 1);

  return (
    <div className="w-full self-start md:sticky md:top-24">
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="relative aspect-[3/4] w-full bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden group cursor-zoom-in"
        aria-label="Perbesar gambar"
      >
        <img
          src={urls[safeIndex]}
          alt={alt}
          className="w-full h-full object-cover"
        />
        <DiscountBadge percent={discountPercent} />
        {soldOut && <SoldBadge />}
        <span className="absolute bottom-3 right-3 z-10 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
          <ZoomIn size={18} />
        </span>
      </button>

      {urls.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {urls.map((url, index) => (
            <button
              key={`${url}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`shrink-0 w-14 aspect-[3/4] rounded-lg overflow-hidden border-2 transition-colors ${
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

      <ImageLightbox
        open={lightboxOpen}
        images={urls}
        index={safeIndex}
        onClose={() => setLightboxOpen(false)}
        onChangeIndex={setActiveIndex}
        alt={alt}
      />
    </div>
  );
}
