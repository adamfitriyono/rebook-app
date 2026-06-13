import API from './api';

export const getDashboardStats = () => API.get('/users/dashboard');
export const getSellerAnalytics = () => API.get('/users/seller/analytics');
