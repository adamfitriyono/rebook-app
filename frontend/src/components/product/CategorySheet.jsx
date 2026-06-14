import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

function CategoryChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition shrink-0 ${
        active ? 'bg-primary text-white' : 'filter-pill-inactive'
      }`}
    >
      {label}
    </button>
  );
}

export default function CategorySheet({
  open,
  categories,
  selected,
  onSelect,
  onClose,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (value) => {
    onSelect(value);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[90] md:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-sheet-title"
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 surface-card rounded-t-2xl shadow-xl max-h-[70vh] flex flex-col animate-slide-up"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
          <h2 id="category-sheet-title" className="text-lg font-bold text-heading">
            Pilih Kategori
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg btn-ghost hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Tutup"
          >
            <X size={20} />
          </button>
        </div>
        <div className="overflow-y-auto p-4">
          <div className="flex flex-wrap gap-2">
            <CategoryChip
              label="Semua"
              active={!selected}
              onClick={() => handleSelect('')}
            />
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                active={selected === cat}
                onClick={() => handleSelect(cat)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
