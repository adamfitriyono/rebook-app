import API from './api';

export const getProductReviews = (productId) => API.get(`/reviews/product/${productId}`);
export const createReview = (data) => API.post('/reviews', data);
