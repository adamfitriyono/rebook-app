import { create } from 'zustand';
import { getFollowedSellerIds, toggleSellerFollow } from '../services/sellerFollows';

export const useSellerFollowStore = create((set, get) => ({
  ids: new Set(),
  loaded: false,

  fetchIds: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ ids: new Set(), loaded: true });
      return;
    }
    try {
      const { data } = await getFollowedSellerIds();
      set({ ids: new Set(data.data), loaded: true });
    } catch {
      set({ ids: new Set(), loaded: true });
    }
  },

  isFollowing: (sellerId) => get().ids.has(sellerId),

  toggle: async (sellerId) => {
    const { data } = await toggleSellerFollow(sellerId);
    const ids = new Set(get().ids);
    if (data.following) ids.add(sellerId);
    else ids.delete(sellerId);
    set({ ids });
    return data.following;
  },

  clear: () => set({ ids: new Set(), loaded: false }),
}));
