import { create } from 'zustand';
import { getWishlistIds, toggleWishlist } from '../services/wishlist';

export const useWishlistStore = create((set, get) => ({
  ids: new Set(),
  loaded: false,

  fetchIds: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ ids: new Set(), loaded: true });
      return;
    }
    try {
      const { data } = await getWishlistIds();
      set({ ids: new Set(data.data), loaded: true });
    } catch {
      set({ ids: new Set(), loaded: true });
    }
  },

  isFavorited: (productId) => get().ids.has(productId),

  toggle: async (productId) => {
    const { data } = await toggleWishlist(productId);
    const ids = new Set(get().ids);
    if (data.favorited) ids.add(productId);
    else ids.delete(productId);
    set({ ids });
    return data.favorited;
  },

  clear: () => set({ ids: new Set(), loaded: false }),
}));
