import API from './api';

export const sendSupportMessage = (message, history) =>
  API.post('/support/chat', { message, history });
