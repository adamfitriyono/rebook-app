import API from './api';

export const searchAddresses = (q) => API.get('/addresses/search', { params: { q } });
