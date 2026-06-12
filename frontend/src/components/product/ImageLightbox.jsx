import { useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const SWIPE_THRESHOLD = 50;

export default function ImageLightbox({ open, images, index, onClose, onChangeIndex, alt = 'Produk' }) {
  const touchStartX = useRef(null);
  const safeIndex = images.length ? Math.min(index, images.length - 1) : 0;

  const goPrev = () => onChangeIndex((safeIndex - 1 + images.length) % images.length);
  const goNext = () => onChangeIndex((safeIndex + 1) % images.length);

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    if (touchStartX.current === null || images.length <= 1) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    if (delta > 0) goPrev();
    else goNext();
  };
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && images.length > 1) {
        onChangeIndex((index - 1 + images.length) % images.length);
      }
      if (e.key === 'ArrowRight' && images.length > 1) {
        onChangeIndex((index + 1) % images.length);
      }
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, index, images.length, onClose, onChangeIndex]);

  if (!open || !images.length) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
        aria-label="Tutup"
      />
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
        aria-label="Tutup"
      >
        <X size={24} />
      </button>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-2 sm:left-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            aria-label="Gambar sebelumnya"
          >
            <ChevronLeft size={28} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-2 sm:right-4 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition"
            aria-label="Gambar berikutnya"
          >
            <ChevronRight size={28} />
          </button>
        </>
      )}

      <img
        src={images[safeIndex]}
        alt={alt}
        className="relative z-[1] max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-white/80 text-sm">
          {safeIndex + 1} / {images.length}
        </p>
      )}
    </div>
  );
}
