// API Configuration
// Using CORS Proxy - Run 'start-cors-proxy.bat' before starting the app
const API_BASE_URL = 'http://localhost:8011/proxy/api';
const WEBHOOK_URL = 'https://aahaas-ai.app.n8n.cloud/webhook/085ddfb8-f53a-456e-b662-85de50da8147';

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
          // Don't set Content-Type - browser will set it automatically with boundary for FormData
        },
        body: formData
      });

      console.log('[RESPONSE] Status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Login failed';

        try {
          const error = await response.json();
          console.log('API Error Response:', error);

          // Handle Laravel validation errors
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
          // If response is not JSON
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
      // Only show connection error if it's actually a connection error
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please check:\n1. Backend server is running\n2. CORS is enabled on the server\n3. API URL is correct: ' + API_BASE_URL);
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
          // Don't set Content-Type - browser will set it automatically with boundary for FormData
        },
        body: formData
      });

      console.log('[RESPONSE] Status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Registration failed';

        try {
          const error = await response.json();
          console.log('API Error Response:', error);

          // Handle Laravel validation errors
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
          // If response is not JSON
          const statusText = response.statusText || response.status;
          errorMessage = `Registration failed: ${statusText} (${response.status})`;
        }

        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      // Only show connection error if it's actually a connection error
      if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
        throw new Error('Cannot connect to server. Please check:\n1. Backend server is running\n2. CORS is enabled on the server\n3. API URL is correct: ' + API_BASE_URL);
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

// Travel Assistant Webhook
export const assistantAPI = {
  sendMessage: async (chatInput, sessionId) => {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatInput: chatInput,
        sessionId: sessionId
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Check if there's any content to parse
    const contentType = response.headers.get('content-type');
    const text = await response.text();

    if (!text) {
      // Return default response if empty
      return {
        output: 'Your quotation is being prepared. Our team will get back to you shortly with a detailed quote.',
        success: true
      };
    }

    if (contentType && contentType.includes('application/json')) {
      try {
        return JSON.parse(text);
      } catch (e) {
        console.error('JSON parse error:', e, 'Response text:', text);
        throw new Error('Invalid JSON response from server');
      }
    }

    // If not JSON, return as plain text response
    return {
      output: text,
      success: true
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

// Default export
const apiServices = {
  authAPI,
  bookingAPI,
  quotationAPI,
  assistantAPI,
  contentAPI
};

export default apiServices;
