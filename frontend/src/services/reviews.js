import API from './api';

export const getProductReviews = (productId) => API.get(`/reviews/product/${productId}`);
export const getReviewEligibility = (productId) => API.get(`/reviews/eligibility/${productId}`);
export const createReview = (data) => API.post('/reviews', data);
