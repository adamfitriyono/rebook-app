import API from './api';

export const getAdminStats = () => API.get('/admin/stats');
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const patchUserRole = (id, role) => API.patch(`/admin/users/${id}/role`, { role });
export const getAdminProducts = (params) => API.get('/admin/products', { params });
export const patchProductAvailability = (id, available) =>
  API.patch(`/admin/products/${id}/availability`, { available });
export const deleteAdminProduct = (id) => API.delete(`/admin/products/${id}`);
export const getAdminOrders = (params) => API.get('/admin/orders', { params });
export const getAdminCategories = () => API.get('/admin/categories');
export const createAdminCategory = (name) => API.post('/admin/categories', { name });
export const deleteAdminCategory = (id) => API.delete(`/admin/categories/${id}`);
