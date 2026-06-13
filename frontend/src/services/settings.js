import API from './api';

export const getPublicFees = () => API.get('/settings/fees');
