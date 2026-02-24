const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const handleResponse = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  return data;
};

export const authAPI = {
  login: (email, password) =>
    fetch(`${API_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ email, password }) }).then(handleResponse),
  register: (name, email, password, confirmPassword) =>
    fetch(`${API_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ name, email, password, confirmPassword }) }).then(handleResponse),
  me: () => fetch(`${API_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
  refresh: () => fetch(`${API_URL}/auth/refresh`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  logout: () => fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
};

export const chatAPI = {
  getSessions: () => fetch(`${API_URL}/chat/sessions`, { headers: getHeaders() }).then(handleResponse),
  createSession: (title) => fetch(`${API_URL}/chat/sessions`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ title }) }).then(handleResponse),
  deleteSession: (id) => fetch(`${API_URL}/chat/sessions/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse),
  getMessages: (sessionId) => fetch(`${API_URL}/chat/sessions/${sessionId}/messages`, { headers: getHeaders() }).then(handleResponse),
  sendMessage: (chatSessionId, message) =>
    fetch(`${API_URL}/chat/send`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ chatSessionId, message }) }).then(handleResponse),
};

export const quotationAPI = {
  list: (params = {}) => fetch(`${API_URL}/quotations?${new URLSearchParams(params)}`, { headers: getHeaders() }).then(handleResponse),
  get: (id) => fetch(`${API_URL}/quotations/${id}`, { headers: getHeaders() }).then(handleResponse),
  accept: (id) => fetch(`${API_URL}/quotations/${id}/accept`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse),
  reject: (id) => fetch(`${API_URL}/quotations/${id}/reject`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse),
  saveFromChat: (chatMessageId) => fetch(`${API_URL}/quotations/save`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ chatMessageId }) }).then(handleResponse),
};

export const adminAPI = {
  getStats: () => fetch(`${API_URL}/admin/stats`, { headers: getHeaders() }).then(handleResponse),
  getUsers: (params = {}) => fetch(`${API_URL}/admin/users?${new URLSearchParams(params)}`, { headers: getHeaders() }).then(handleResponse),
  getUser: (id) => fetch(`${API_URL}/admin/users/${id}`, { headers: getHeaders() }).then(handleResponse),
  toggleUser: (id) => fetch(`${API_URL}/admin/users/${id}/toggle`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse),
  getQuotations: (params = {}) => fetch(`${API_URL}/admin/quotations?${new URLSearchParams(params)}`, { headers: getHeaders() }).then(handleResponse),
};

export default { authAPI, chatAPI, quotationAPI, adminAPI };
