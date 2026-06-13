import API from './api';

export const getMyDisputes = () => API.get('/disputes');
export const createDispute = (data) => API.post('/disputes', data);
