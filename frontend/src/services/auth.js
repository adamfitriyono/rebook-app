import API from './api';

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const logout = () => API.post('/auth/logout');
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => {
  if (data instanceof FormData) {
    return API.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } });
  }
  return API.put('/auth/profile', data);
};
