// API Configuration
// Development: Uses local proxy via setupProxy.js to bypass CORS
// Production: Direct HTTPS connection to backend
//
// Local Proxy automatically forwards:
//   /api/* -> https://stagev2.appletechlabs.com/api/*
//
// Override with REACT_APP_API_URL environment variable if needed

// Determine which API URL to use based on environment
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    console.log('[API] Using custom API URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }

  if (process.env.NODE_ENV === 'development') {
    console.log('[API] Using local development proxy via setupProxy.js');
    return '/api';
  }

  console.log('[API] Using production backend: https://stagev2.appletechlabs.com/api');
  return 'https://stagev2.appletechlabs.com/api';
};

const API_BASE_URL = getApiBaseUrl();
const DEFAULT_WEBHOOK_URL = 'https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147';
const LEGACY_WEBHOOK_URL = 'https://aahaas-ai.app.n8n.cloud/webhook/d7aa38a3-c48f-4c89-b557-292512a35342';
const WEBHOOK_URL = process.env.REACT_APP_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;

console.log('[API CONFIG] Base URL:', API_BASE_URL);
console.log('[API CONFIG] Webhook URL:', WEBHOOK_URL, process.env.REACT_APP_WEBHOOK_URL ? '(env override)' : '(default)');

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Helper function to create headers
const createHeaders = (includeAuth = false) => {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  };

  if (includeAuth) {
    const token = getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

// Authentication APIs
export const authAPI = {
  login: async (email, password) => {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);

    console.log('[LOGIN] Attempting login with:', { email });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      console.log('[RESPONSE] Status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Login failed';

        try {
          const error = await response.json();
          console.log('API Error Response:', error);

          if (error.errors) {
            const validationErrors = Object.values(error.errors).flat();
            errorMessage = validationErrors.join(', ');
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.error) {
            errorMessage = error.error;
          } else if (response.status === 401) {
            errorMessage = 'Invalid email or password';
          } else {
            errorMessage = JSON.stringify(error);
          }
        } catch (e) {
          if (response.status === 401) {
            errorMessage = 'Invalid email or password';
          } else {
            const statusText = response.statusText || response.status;
            errorMessage = `Login failed: ${statusText} (${response.status})`;
          }
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to backend server. Please check:\n1. Backend server is running at: ' + API_BASE_URL + '\n2. CORS is enabled on the backend\n3. Your internet connection is working');
      }
      throw error;
    }
  },

  register: async (name, email, password, passwordConfirmation) => {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('password_confirmation', passwordConfirmation);

    console.log('[REGISTER] Attempting registration with:', { name, email });

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      console.log('[RESPONSE] Status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Registration failed';

        try {
          const error = await response.json();
          console.log('API Error Response:', error);

          if (error.errors) {
            const validationErrors = Object.entries(error.errors).map(([field, messages]) => {
              return Array.isArray(messages) ? messages.join(', ') : messages;
            });
            errorMessage = validationErrors.join(' ');
          } else if (error.message) {
            errorMessage = error.message;
          } else if (error.error) {
            errorMessage = error.error;
          } else {
            errorMessage = JSON.stringify(error);
          }
        } catch (e) {
          const statusText = response.statusText || response.status;
          errorMessage = `Registration failed: ${statusText} (${response.status})`;
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to backend server. Please check:\n1. Backend server is running at: ' + API_BASE_URL + '\n2. CORS is enabled on the backend\n3. Your internet connection is working');
      }
      throw error;
    }
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: createHeaders(true),
      body: new FormData()
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }

    return await response.json();
  },

  getUser: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: createHeaders(true)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user data');
    }

    return await response.json();
  },

  refresh: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: createHeaders(true),
      body: new FormData()
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    return await response.json();
  }
};

// Booking APIs
export const bookingAPI = {
  save: async (bookingData) => {
    const response = await fetch(`${API_BASE_URL}/booking/save`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Booking save failed');
    }

    return await response.json();
  },

  retrieve: async (quotationNo, referenceId) => {
    const response = await fetch(`${API_BASE_URL}/booking/retrieve`, {
      method: 'POST',
      headers: createHeaders(true),
      body: JSON.stringify({
        quotation_no: quotationNo,
        reference_id: referenceId
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Booking retrieval failed');
    }

    return await response.json();
  }
};

// Quotation APIs
export const quotationAPI = {
  list: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/quotation/list?${queryParams}`, {
      method: 'GET',
      headers: createHeaders(true)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch quotations');
    }

    return await response.json();
  },

  viewPNL: async (referenceId, quotationNo, currency = 'USD') => {
    const queryParams = new URLSearchParams({
      reference_id: referenceId,
      quotation_no: quotationNo,
      currency: currency
    }).toString();

    const response = await fetch(`${API_BASE_URL}/quotation/view/pnl?${queryParams}`, {
      method: 'GET',
      headers: createHeaders(true)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch PNL data');
    }

    return await response.json();
  }
};

// Travel Assistant Webhook with fallback
export const assistantAPI = {
  sendMessage: async (chatInput, sessionId, chatId) => {
    // n8n expects an ARRAY format as per developer specification
    // Format: [{ "chatInput": "...", "action": "sendMessage" }]
    const payload = [
      {
        chatInput: chatInput,
        action: "sendMessage"
      }
    ];

    // Simple headers - just Content-Type
    // n8n webhook doesn't need auth headers as sessionId is in the payload
    const webhookHeaders = {
      'Content-Type': 'application/json'
    };

    const tryWebhook = async (url, label, timeoutMs = 120000) => {
      console.log(`[WEBHOOK] Sending to (${label}):`, url);
      console.log('[WEBHOOK] Payload:', JSON.stringify(payload));
      console.log('[WEBHOOK] Headers:', webhookHeaders);

      try {
        // Create an abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const resp = await fetch(url, {
          method: 'POST',
          headers: webhookHeaders,
          body: JSON.stringify(payload),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const contentType = resp.headers.get('content-type');
        const text = await resp.text();

        console.log(`[WEBHOOK] Response Status (${label}):`, resp.status);
        console.log(`[WEBHOOK] Content-Type (${label}):`, contentType);
        console.log(`[WEBHOOK] Response Text (${label}):`, text);
        console.log(`[WEBHOOK] Response Text Length (${label}):`, text?.length);

        if (!resp.ok) {
          console.error(`[WEBHOOK] HTTP error from ${label}! status: ${resp.status}`);
          return null;
        }

        if (!text || text.trim() === '') {
          console.error(`[WEBHOOK] Empty response from ${label}`);
          return null;
        }

        if (contentType && contentType.includes('application/json')) {
          try {
            const jsonResponse = JSON.parse(text);
            console.log(`[WEBHOOK] Parsed JSON Response (${label}):`, jsonResponse);
            console.log(`[WEBHOOK] Response Keys (${label}):`, Object.keys(jsonResponse));
            return jsonResponse;
          } catch (e) {
            console.error(`[WEBHOOK] JSON parse error (${label}):`, e);
            console.error(`[WEBHOOK] Failed to parse text (${label}):`, text);
            return null;
          }
        }

        console.log(`[WEBHOOK] Non-JSON response received (${label})`);
        return null;
      } catch (error) {
        if (error.name === 'AbortError') {
          console.error(`[WEBHOOK] Request timeout (${label}) after ${timeoutMs}ms`);
          return null;
        }
        console.error(`[WEBHOOK] Request failed (${label}):`, error.message);
        return null;
      }
    };

    console.log('[WEBHOOK] Attempting primary webhook...');
    const primaryResp = await tryWebhook(WEBHOOK_URL, 'primary', 120000);
    if (primaryResp) {
      console.log('[WEBHOOK] Primary webhook succeeded');
      return primaryResp;
    }

    console.warn('[WEBHOOK] Primary returned empty/null/timeout. Falling back to legacy URL...');
    const legacyResp = await tryWebhook(LEGACY_WEBHOOK_URL, 'legacy', 120000);
    if (legacyResp) {
      console.log('[WEBHOOK] Legacy webhook succeeded');
      return legacyResp;
    }

    console.error('[WEBHOOK] Both webhooks failed. Returning error response.');
    return {
      error: 'The AI assistant is temporarily unavailable. This could be due to:\n\n1. The n8n workflow is not responding (check n8n execution logs)\n2. The workflow execution is timing out (> 120 seconds)\n3. The webhook URL may have changed\n\nPlease check the n8n workflow status and logs.',
      success: false,
      details: 'Both primary and legacy webhook endpoints failed to respond'
    };
  }
};

// Content APIs (for reference, if needed)
export const contentAPI = {
  getPlaces: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/content/place/?${queryParams}`, {
      method: 'GET',
      headers: createHeaders(true)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch places');
    }

    return await response.json();
  },

  getHotels: async (params = {}) => {
    const queryParams = new URLSearchParams(params).toString();
    const response = await fetch(`${API_BASE_URL}/content/hotel?${queryParams}`, {
      method: 'GET',
      headers: createHeaders(true)
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hotels');
    }

    return await response.json();
  }
};

const apiServices = {
  authAPI,
  bookingAPI,
  quotationAPI,
  assistantAPI,
  contentAPI
};

export default apiServices;
