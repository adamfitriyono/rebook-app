import API from './api';

export const getAdminStats = () => API.get('/admin/stats');
export const getAdminAnalytics = () => API.get('/admin/analytics');
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const patchUserRole = (id, role) => API.patch(`/admin/users/${id}/role`, { role });
export const patchUserSellerVerified = (id, verified) =>
  API.patch(`/admin/users/${id}/verify`, { verified });
export const impersonateUser = (id) => API.post(`/admin/users/${id}/impersonate`);
export const getAdminProducts = (params) => API.get('/admin/products', { params });
export const patchProductAvailability = (id, available) =>
  API.patch(`/admin/products/${id}/availability`, { available });
export const deleteAdminProduct = (id) => API.delete(`/admin/products/${id}`);
export const getAdminOrders = (params) => API.get('/admin/orders', { params });
export const patchAdminOrder = (id, data) => API.patch(`/admin/orders/${id}`, data);
export const getAdminCategories = () => API.get('/admin/categories');
export const createAdminCategory = (name) => API.post('/admin/categories', { name });
export const deleteAdminCategory = (id) => API.delete(`/admin/categories/${id}`);

export const getAdminReviews = () => API.get('/admin/reviews');
export const patchAdminReview = (id, data) => API.patch(`/admin/reviews/${id}`, data);
export const deleteAdminReview = (id) => API.delete(`/admin/reviews/${id}`);
export const getAdminReports = (params) => API.get('/admin/reports', { params });
export const patchAdminReport = (id, data) => API.patch(`/admin/reports/${id}`, data);

export const getAdminBanners = () => API.get('/admin/banners');
export const createAdminBanner = (data) => API.post('/admin/banners', data);
export const updateAdminBanner = (id, data) => API.patch(`/admin/banners/${id}`, data);
export const deleteAdminBanner = (id) => API.delete(`/admin/banners/${id}`);

export const getAdminDisputes = (params) => API.get('/admin/disputes', { params });
export const patchAdminDispute = (id, data) => API.patch(`/admin/disputes/${id}`, data);

export const getAdminAuditLogs = () => API.get('/admin/audit-logs');
export const getAdminSettings = () => API.get('/admin/settings');
export const patchAdminSettings = (data) => API.patch('/admin/settings', data);
