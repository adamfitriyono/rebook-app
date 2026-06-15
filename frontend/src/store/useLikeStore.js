import { create } from 'zustand';
import { getLikedIds, toggleLike } from '../services/likes';

export const useLikeStore = create((set, get) => ({
  likedIds: new Set(),
  counts: {},
  loaded: false,

  fetchIds: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ likedIds: new Set(), loaded: true });
      return;
    }
    try {
      const { data } = await getLikedIds();
      set({ likedIds: new Set(data.data), loaded: true });
    } catch {
      set({ likedIds: new Set(), loaded: true });
    }
  },

  isLiked: (productId) => get().likedIds.has(productId),

  getCount: (productId, fallback = 0) => {
    const cached = get().counts[productId];
    return cached !== undefined ? cached : fallback;
  },

  seedCount: (productId, count) => {
    if (count === undefined) return;
    if (get().counts[productId] !== undefined) return;
    set({ counts: { ...get().counts, [productId]: count } });
  },

  toggle: async (productId) => {
    const { data } = await toggleLike(productId);
    const likedIds = new Set(get().likedIds);
    if (data.liked) likedIds.add(productId);
    else likedIds.delete(productId);
    set({
      likedIds,
      counts: { ...get().counts, [productId]: data.likeCount },
    });
    return data;
  },

  clear: () => set({ likedIds: new Set(), counts: {}, loaded: false }),
}));
