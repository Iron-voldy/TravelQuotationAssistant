import { clearSession, getStoredLoginPath, parseStoredUser, persistSession } from './session';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Track if a refresh is in progress to avoid multiple simultaneous refresh attempts
let refreshing = false;
let refreshPromise = null;

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

const redirectToLogin = () => {
  const redirectPath = getStoredLoginPath();
  clearSession();
  window.location.href = redirectPath;
};

const parseResponseBody = async (res) => {
  const text = await res.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const attemptTokenRefresh = async () => {
  // If a refresh is already in progress, wait for it to complete
  if (refreshing) {
    return refreshPromise;
  }

  refreshing = true;
  refreshPromise = (async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token to refresh');
      }

      console.log('[API] Attempting token refresh...');
      const res = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });

      if (res.ok) {
        const data = await parseResponseBody(res);
        console.log('[API] Token refresh response status:', res.status);
        
        // Ensure we have a new token before persisting
        if (!data.token) {
          console.error('[API] No token in refresh response:', data);
          throw new Error('No token in refresh response');
        }
        
        persistSession({
          token: data.token,
          user: parseStoredUser(),
          appleAccessToken: data.appleAccessToken || localStorage.getItem('appleAccessToken'),
          loginPath: getStoredLoginPath()
        });
        console.log('[API] ✅ Token refreshed successfully');
        return true;
      } else {
        const errorData = await parseResponseBody(res);
        console.warn('[API] Token refresh failed with status:', res.status, errorData);
        return false;
      }
    } catch (e) {
      console.error('[API] Token refresh error:', e.message);
      return false;
    } finally {
      refreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const handleResponse = async (res) => {
  const data = await parseResponseBody(res);
  if (!res.ok) {
    if (res.status === 401) {
      // Token expired or invalid — attempt refresh once
      console.warn('[API] ❌ Received 401 error, attemptin token refresh...');
      const refreshSucceeded = await attemptTokenRefresh();
      
      if (!refreshSucceeded) {
        // Refresh failed or no token available — clear auth and redirect to login
        console.log('[API] 🔒 Token refresh failed, logging out user to re-authenticate');
        redirectToLogin();
        throw new Error('Session expired. Please log in again.');
      }
      // If refresh succeeded, the caller should retry the original request with new token
      console.log('[API] 🔄 Token refreshed, will retry request');
      throw new Error('TOKEN_REFRESHED_RETRY');
    }
    throw new Error(data.error || data.message || `Request failed: ${res.status}`);
  }
  return data;
};

export const authAPI = {
  login: (email, password) =>
    fetch(`${API_URL}/auth/login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ email, password }) }).then(handleResponse),
  agentLogin: (email, password) =>
    fetch(`${API_URL}/auth/agent-login`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ email, password }) }).then(handleResponse),
  register: (name, email, password, confirmPassword) =>
    fetch(`${API_URL}/auth/register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ name, email, password, confirmPassword }) }).then(handleResponse),
  me: () => fetch(`${API_URL}/auth/me`, { headers: getHeaders() }).then(handleResponse),
  refresh: () => fetch(`${API_URL}/auth/refresh`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  logout: () => fetch(`${API_URL}/auth/logout`, { method: 'POST', headers: getHeaders() }).then(handleResponse),
  updateTheme: (themePreference) =>
    fetch(`${API_URL}/auth/me/theme`, { method: 'PUT', headers: getHeaders(), body: JSON.stringify({ themePreference }) }).then(handleResponse),
};

// Helper to make retryable API calls
const makeRetryableCall = async (fetchFn) => {
  try {
    return await fetchFn();
  } catch (e) {
    if (e.message === 'TOKEN_REFRESHED_RETRY') {
      // Retry the call with the new token
      console.log('[API] 🔄 Retrying request with refreshed token');
      try {
        return await fetchFn();
      } catch (retryError) {
        console.error('[API] ❌ Retry failed:', retryError.message);
        throw retryError;
      }
    }
    throw e;
  }
};

export const chatAPI = {
  getSessions: () => makeRetryableCall(() => fetch(`${API_URL}/chat/sessions`, { headers: getHeaders() }).then(handleResponse)),
  createSession: (title) => makeRetryableCall(() => fetch(`${API_URL}/chat/sessions`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ title }) }).then(handleResponse)),
  deleteSession: (id) => makeRetryableCall(() => fetch(`${API_URL}/chat/sessions/${id}`, { method: 'DELETE', headers: getHeaders() }).then(handleResponse)),
  getMessages: (sessionId) => makeRetryableCall(() => fetch(`${API_URL}/chat/sessions/${sessionId}/messages`, { headers: getHeaders() }).then(handleResponse)),
  sendMessage: (chatSessionId, message) =>
    makeRetryableCall(() => fetch(`${API_URL}/chat/send`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ chatSessionId, message }) }).then(handleResponse)),
};

export const quotationAPI = {
  list: (params = {}) => makeRetryableCall(() => fetch(`${API_URL}/quotations?${new URLSearchParams(params)}`, { headers: getHeaders() }).then(handleResponse)),
  get: (id) => makeRetryableCall(() => fetch(`${API_URL}/quotations/${id}`, { headers: getHeaders() }).then(handleResponse)),
  accept: (id) => makeRetryableCall(() => fetch(`${API_URL}/quotations/${id}/accept`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse)),
  reject: (id) => makeRetryableCall(() => fetch(`${API_URL}/quotations/${id}/reject`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse)),
  saveFromChat: (chatMessageId) => makeRetryableCall(() => fetch(`${API_URL}/quotations/save`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ chatMessageId }) }).then(handleResponse)),
  rejectFromChat: (chatMessageId) => makeRetryableCall(() => fetch(`${API_URL}/quotations/reject-from-chat`, { method: 'POST', headers: getHeaders(), body: JSON.stringify({ chatMessageId }) }).then(handleResponse)),
};

export const adminAPI = {
  getStats: () => makeRetryableCall(() => fetch(`${API_URL}/admin/stats`, { headers: getHeaders() }).then(handleResponse)),
  getUsers: (params = {}) => makeRetryableCall(() => fetch(`${API_URL}/admin/users?${new URLSearchParams(params)}`, { headers: getHeaders() }).then(handleResponse)),
  getUser: (id) => makeRetryableCall(() => fetch(`${API_URL}/admin/users/${id}`, { headers: getHeaders() }).then(handleResponse)),
  toggleUser: (id) => makeRetryableCall(() => fetch(`${API_URL}/admin/users/${id}/toggle`, { method: 'PATCH', headers: getHeaders() }).then(handleResponse)),
  getQuotations: (params = {}) => makeRetryableCall(() => fetch(`${API_URL}/admin/quotations?${new URLSearchParams(params)}`, { headers: getHeaders() }).then(handleResponse)),
};

export const assistantAPI = {
  // backendSessionId: the DB chat_session id returned from a previous call in the same chat.
  // Pass it so the backend reuses the same session (and n8n conversation context) instead of
  // creating a brand-new session for every single message.
  sendMessage: async (chatInput, sessionId, chatId, backendSessionId) => {
    const data = await makeRetryableCall(() =>
      fetch(`${API_URL}/chat/send`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ chatSessionId: backendSessionId || null, message: chatInput })
      }).then(handleResponse)
    );

    // Map backend response format to what the frontend expects
    // Backend returns: { success, message: {content, ...}, quotationNo, isSuccess, chatSessionId }
    // Frontend expects: { quotation_no, status, message, error, chatSessionId, ... }
    if (data.isSuccess && data.quotationNo) {
      return {
        quotation_no: data.quotationNo,
        status: 'success',
        message: data.message?.content || `Quotation ${data.quotationNo} created successfully`,
        chatSessionId: data.chatSessionId
      };
    } else if (data.success === false || data.error) {
      return {
        error: data.error || data.message?.content || 'Request failed',
        success: false,
        chatSessionId: data.chatSessionId
      };
    } else {
      return {
        message: data.message?.content || 'No quotation was generated.',
        success: data.success,
        chatSessionId: data.chatSessionId
      };
    }
  }
};

const apiServices = { authAPI, chatAPI, quotationAPI, adminAPI, assistantAPI };
export default apiServices;
