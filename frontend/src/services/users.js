import API from './api';

export const getDashboardStats = () => API.get('/users/dashboard');
