import API from './api';

export const getWishlist = () => API.get('/wishlist');
export const getWishlistIds = () => API.get('/wishlist/ids');
export const toggleWishlist = (productId) => API.post('/wishlist/toggle', { productId });
export const addToWishlist = (productId) => API.post('/wishlist', { productId });
export const removeFromWishlist = (productId) => API.delete(`/wishlist/${productId}`);
