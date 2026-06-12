import { useEffect, useState } from 'react';
import { getCategories } from '../services/products';

export default function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    setLoading(true);
    return getCategories()
      .then(({ data }) => setCategories(data.data || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh();
  }, []);

  return { categories, loading, refresh };
}
