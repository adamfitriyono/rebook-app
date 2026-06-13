import API from './api';

export const searchAddresses = (q) => API.get('/addresses/search', { params: { q } });

export const getSavedAddresses = () => API.get('/addresses');
export const createSavedAddress = (data) => API.post('/addresses', data);
export const updateSavedAddress = (id, data) => API.put(`/addresses/${id}`, data);
export const deleteSavedAddress = (id) => API.delete(`/addresses/${id}`);
export const setDefaultSavedAddress = (id) => API.patch(`/addresses/${id}/default`);
