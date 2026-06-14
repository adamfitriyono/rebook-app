import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import useCategories from '../../hooks/useCategories';
import CategorySheet from './CategorySheet';

const VISIBLE_MOBILE_COUNT = 4;

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

function getVisibleMobileCategories(categories, selected, limit = VISIBLE_MOBILE_COUNT) {
  if (categories.length <= limit) return categories;

  let visible = categories.slice(0, limit);
  if (selected && categories.includes(selected) && !visible.includes(selected)) {
    visible = [...categories.slice(0, limit - 1), selected];
  }
  return visible;
}

export default function CategoryFilter({ selected, onSelect }) {
  const { categories, loading } = useCategories();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (loading) {
    return (
      <>
        <div className="flex flex-nowrap gap-2 mb-6 overflow-hidden min-w-0 max-w-full md:hidden">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-9 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse shrink-0" />
          ))}
        </div>
        <div className="hidden md:flex flex-wrap gap-2 mb-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ))}
        </div>
      </>
    );
  }

  const showMoreButton = categories.length > VISIBLE_MOBILE_COUNT;
  const visibleMobile = getVisibleMobileCategories(categories, selected);

  return (
    <>
      {/* Mobile: limited chips + Lainnya */}
      <div className="md:hidden mb-6 min-w-0 max-w-full">
        <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide pb-1 min-w-0 max-w-full">
          <CategoryChip
            label="Semua"
            active={!selected}
            onClick={() => onSelect('')}
          />
          {visibleMobile.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              active={selected === cat}
              onClick={() => onSelect(cat)}
            />
          ))}
          {showMoreButton && (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium shrink-0 filter-pill-inactive"
            >
              Lainnya
              <ChevronDown size={16} />
            </button>
          )}
        </div>
        <CategorySheet
          open={sheetOpen}
          categories={categories}
          selected={selected}
          onSelect={onSelect}
          onClose={() => setSheetOpen(false)}
        />
      </div>

      {/* Desktop: all chips wrap */}
      <div className="hidden md:flex flex-wrap gap-2 mb-6">
        <CategoryChip
          label="Semua"
          active={!selected}
          onClick={() => onSelect('')}
        />
        {categories.map((cat) => (
          <CategoryChip
            key={cat}
            label={cat}
            active={selected === cat}
            onClick={() => onSelect(cat)}
          />
        ))}
      </div>
    </>
  );
}
