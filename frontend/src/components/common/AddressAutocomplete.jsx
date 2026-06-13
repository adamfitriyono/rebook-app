import { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';
import { searchAddresses } from '../../services/addresses';

const DEBOUNCE_MS = 400;
const MIN_QUERY_LENGTH = 3;

export default function AddressAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Cari alamat jalan...',
  error,
  disabled = false,
  name,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchError, setSearchError] = useState('');
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const closeDropdown = useCallback(() => {
    setOpen(false);
    setActiveIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        closeDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeDropdown]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const query = value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
      setSearchError('');
      return undefined;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setSearchError('');
        const { data } = await searchAddresses(query);
        setSuggestions(data.data || []);
        setOpen(true);
        setActiveIndex(-1);
      } catch (err) {
        setSuggestions([]);
        setSearchError(
          err.response?.data?.error || 'Gagal memuat saran alamat. Anda tetap bisa isi manual.',
        );
      } finally {
        setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [value]);

  const handleSelect = (item) => {
    onChange(item.addressLine || item.label);
    onSelect?.({
      addressLine: item.addressLine,
      city: item.city,
      province: item.province,
    });
    closeDropdown();
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Escape') closeDropdown();
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <MapPin
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
        />
        <input
          type="text"
          name={name}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          className={`input-field pl-9 pr-9 ${error ? 'border-red-500' : ''}`}
        />
        {loading && (
          <Loader2
            size={16}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-subtle animate-spin"
          />
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {searchError && !error && (
        <p className="text-amber-600 dark:text-amber-400 text-xs mt-1">{searchError}</p>
      )}

      <p className="text-[11px] text-subtle mt-1">
        Powered by{' '}
        <a
          href="https://www.openstreetmap.org/copyright"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-primary"
        >
          OpenStreetMap
        </a>
      </p>

      {open && suggestions.length > 0 && (
        <ul
          className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg"
          role="listbox"
        >
          {suggestions.map((item, index) => (
            <li key={item.id} role="option" aria-selected={index === activeIndex}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(item)}
                className={`w-full text-left px-3 py-2.5 text-sm border-b border-gray-100 dark:border-gray-800 last:border-0 transition-colors ${
                  index === activeIndex
                    ? 'bg-primary/10 text-heading'
                    : 'text-muted hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <span className="line-clamp-2">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
