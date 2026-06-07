import { CATEGORIES } from '../../utils/constants';

export default function CategoryFilter({ selected, onSelect }) {
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
      {CATEGORIES.map((cat) => (
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
