import { create } from 'zustand';
import { getProfile, login as loginApi, register as registerApi } from '../services/auth';
import { getCart } from '../services/cart';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ loading: false });
      return;
    }
    try {
      const { data } = await getProfile();
      set({ user: data.user, loading: false });
    } catch {
      localStorage.removeItem('token');
      set({ user: null, loading: false });
    }
  },

  login: async (credentials) => {
    const { data } = await loginApi(credentials);
    localStorage.setItem('token', data.token);
    set({ user: data.user });
    return data;
  },

  register: async (userData) => {
    const { data } = await registerApi(userData);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  },

  setUser: (user) => set({ user }),
}));

export const useCartStore = create((set) => ({
  cart: null,
  itemCount: 0,

  fetchCart: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ cart: null, itemCount: 0 });
      return;
    }
    try {
      const { data } = await getCart();
      set({ cart: data.data, itemCount: data.data.itemCount });
    } catch {
      set({ cart: null, itemCount: 0 });
    }
  },

  setCart: (cart) => set({ cart, itemCount: cart?.itemCount || 0 }),
}));
