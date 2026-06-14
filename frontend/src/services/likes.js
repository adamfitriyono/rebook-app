import API from './api';

export const getLikedIds = () => API.get('/likes/ids');
export const toggleLike = (productId) => API.post('/likes/toggle', { productId });
