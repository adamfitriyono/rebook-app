import API from './api';

export const getOrders = (params) => API.get('/orders', { params });
export const getOrderById = (id) => API.get(`/orders/${id}`);
export const createOrder = (data) => API.post('/orders', data);
export const confirmOrder = (id) => API.put(`/orders/${id}/confirm`);
export const cancelOrder = (id) => API.put(`/orders/${id}/cancel`);
export const getSellerOrders = () => API.get('/orders/seller');
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);
