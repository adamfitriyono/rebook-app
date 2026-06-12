import API from './api';

export const getConversations = () => API.get('/chat/conversations');
export const getUnreadCount = () => API.get('/chat/unread-count');
export const createConversation = (data) => API.post('/chat/conversations', data);
export const getMessages = (conversationId) => API.get(`/chat/conversations/${conversationId}/messages`);
export const sendMessage = (conversationId, content) =>
  API.post(`/chat/conversations/${conversationId}/messages`, { content });
export const markAsRead = (conversationId) => API.patch(`/chat/conversations/${conversationId}/read`);
