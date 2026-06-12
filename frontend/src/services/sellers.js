import API from './api';

export const getSellerProfile = (id) => API.get(`/sellers/${id}`);
export const getSellerProducts = (id, params) => API.get(`/sellers/${id}/products`, { params });
