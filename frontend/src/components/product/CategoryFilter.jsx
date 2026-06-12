import useCategories from '../../hooks/useCategories';

export default function CategoryFilter({ selected, onSelect }) {
  const { categories, loading } = useCategories();

  if (loading) {
    return (
      <div className="flex flex-wrap gap-2 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-9 w-20 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <button
        type="button"
        onClick={() => onSelect('')}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
          !selected ? 'bg-primary text-white' : 'filter-pill-inactive'
        }`}
      >
        Semua
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            selected === cat ? 'bg-primary text-white' : 'filter-pill-inactive'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
