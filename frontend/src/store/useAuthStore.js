import { create } from 'zustand';
import { getProfile, login as loginApi, register as registerApi } from '../services/auth';
import { getCart } from '../services/cart';
import { impersonateUser as impersonateUserApi } from '../services/admin';
import { useLikeStore } from './useLikeStore';
import { useSellerFollowStore } from './useSellerFollowStore';

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,
  impersonating: !!sessionStorage.getItem('adminToken'),

  init: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ loading: false, impersonating: false });
      return;
    }
    try {
      const { data } = await getProfile();
      set({
        user: data.user,
        loading: false,
        impersonating: !!sessionStorage.getItem('adminToken'),
      });
    } catch {
      localStorage.removeItem('token');
      sessionStorage.removeItem('adminToken');
      set({ user: null, loading: false, impersonating: false });
    }
  },

  login: async (credentials) => {
    const { data } = await loginApi(credentials);
    localStorage.setItem('token', data.token);
    sessionStorage.removeItem('adminToken');
    set({ user: data.user, impersonating: false });
    useLikeStore.getState().fetchIds();
    useSellerFollowStore.getState().fetchIds();
    return data;
  },

  register: async (userData) => {
    const { data } = await registerApi(userData);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem('adminToken');
    set({ user: null, impersonating: false });
    useLikeStore.getState().clear();
    useSellerFollowStore.getState().clear();
    useCartStore.getState().setCart(null);
  },

  setUser: (user) => set({ user }),

  startImpersonation: async (userId) => {
    const adminToken = localStorage.getItem('token');
    const { data } = await impersonateUserApi(userId);
    sessionStorage.setItem('adminToken', adminToken);
    localStorage.setItem('token', data.token);
    set({ user: data.user, impersonating: true });
    useLikeStore.getState().clear();
    useSellerFollowStore.getState().clear();
    useCartStore.getState().fetchCart();
    useLikeStore.getState().fetchIds();
    useSellerFollowStore.getState().fetchIds();
    return data;
  },

  endImpersonation: async () => {
    const adminToken = sessionStorage.getItem('adminToken');
    if (!adminToken) return;
    localStorage.setItem('token', adminToken);
    sessionStorage.removeItem('adminToken');
    const { data } = await getProfile();
    set({ user: data.user, impersonating: false });
    useLikeStore.getState().clear();
    useSellerFollowStore.getState().clear();
    useCartStore.getState().setCart(null);
    useCartStore.getState().fetchCart();
    useLikeStore.getState().fetchIds();
    useSellerFollowStore.getState().fetchIds();
  },
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
    const user = useAuthStore.getState().user;
    if (user?.role === 'admin') {
      set({ cart: null, itemCount: 0 });
      return;
    }
    try {
      const { data } = await getCart();
      set({ cart: data.data, itemCount: data.data?.itemCount ?? 0 });
    } catch {
      set({ cart: null, itemCount: 0 });
    }
  },

  setCart: (cart) => set({ cart, itemCount: cart?.itemCount || 0 }),
}));
