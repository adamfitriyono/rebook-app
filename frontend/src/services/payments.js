import API from './api';

export const processPayment = (data) => API.post('/payments', data);
export const getPaymentStatus = (orderId) => API.get(`/payments/${orderId}`);
