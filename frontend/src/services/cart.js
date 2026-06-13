import API from './api';

export const getCart = () => API.get('/cart');
export const addToCart = (data) => API.post('/cart/items', data);
export const updateCartItem = (itemId, data) => API.put(`/cart/items/${itemId}`, data);
export const updateCartSelection = (data) => API.patch('/cart/selection', data);
export const removeCartItem = (itemId) => API.delete(`/cart/items/${itemId}`);
export const clearCart = () => API.delete('/cart');
