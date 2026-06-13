import API from './api';

export const getFollowedSellers = () => API.get('/seller-follows');
export const getFollowedSellerIds = () => API.get('/seller-follows/ids');
export const toggleSellerFollow = (sellerId) => API.post('/seller-follows/toggle', { sellerId });
