// DEMO MODE API
// This file simulates API responses for frontend testing without backend
// To use: Rename this file to api.js (backup the original first)

// Configuration
const API_BASE_URL = 'https://stagev2.appletechlabs.com/api';
const WEBHOOK_URL = 'https://applehds.app.n8n.cloud/webhook-test/e3073b45-1349-49f2-98c5-ff147e2a278d';

// Demo delay to simulate network request
const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

// Demo data
const demoUsers = [
  {
    id: 1,
    name: "Demo User",
    email: "demo@example.com",
    password: "Demo1234"
  }
];

let registeredUsers = [...demoUsers];

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Authentication APIs (DEMO MODE)
export const authAPI = {
  login: async (email, password) => {
    await delay(1000);

    console.log('[DEMO MODE] Login attempt', { email });

    const user = registeredUsers.find(u => u.email === email && u.password === password);

    if (!user) {
      throw new Error('Invalid email or password. Try: demo@example.com / Demo1234');
    }

    return {
      access_token: `demo_token_${Date.now()}`,
      token_type: "bearer",
      expires_in: 3600,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    };
  },

  register: async (name, email, password, passwordConfirmation) => {
    await delay(1000);

    console.log('[DEMO MODE] Register attempt', { name, email });

    // Check if user already exists
    if (registeredUsers.find(u => u.email === email)) {
      throw new Error('Email already registered');
    }

    // Validate password
    if (password !== passwordConfirmation) {
      throw new Error('Passwords do not match');
    }

    // Create new user
    const newUser = {
      id: registeredUsers.length + 1,
      name,
      email,
      password
    };

    registeredUsers.push(newUser);

    // Auto-login after registration
    return {
      access_token: `demo_token_${Date.now()}`,
      token_type: "bearer",
      expires_in: 3600,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email
      }
    };
  },

  logout: async () => {
    await delay(500);
    console.log('[DEMO MODE] Logout');
    return { message: "Logged out successfully" };
  },

  getUser: async () => {
    await delay(500);
    console.log('[DEMO MODE] Get user info');

    const token = getAuthToken();
    if (!token || !token.startsWith('demo_token_')) {
      throw new Error('Invalid token');
    }

    return {
      id: 1,
      name: "Demo User",
      email: "demo@example.com"
    };
  },

  refresh: async () => {
    await delay(500);
    console.log('[DEMO MODE] Refresh token');

    return {
      access_token: `demo_token_${Date.now()}`,
      token_type: "bearer",
      expires_in: 3600
    };
  }
};

// Booking APIs (DEMO MODE)
export const bookingAPI = {
  save: async (bookingData) => {
    await delay(1500);
    console.log('[DEMO MODE] Save booking', bookingData);

    return {
      success: true,
      booking_id: `BOOK${Date.now()}`,
      quotation_no: Math.floor(Math.random() * 900000) + 100000,
      message: "Booking saved successfully"
    };
  },

  retrieve: async (quotationNo, referenceId) => {
    await delay(1000);
    console.log('[DEMO MODE] Retrieve booking', { quotationNo, referenceId });

    return {
      quotation_no: quotationNo,
      reference_id: referenceId,
      status: "confirmed",
      booking_details: {
        destination: "Demo Destination",
        duration: "7 days",
        travelers: 2
      }
    };
  }
};

// Quotation APIs (DEMO MODE)
export const quotationAPI = {
  list: async (params = {}) => {
    await delay(1000);
    console.log('[DEMO MODE] List quotations', params);

    return {
      data: [
        {
          id: 1,
          quotation_no: "370442",
          destination: "Bali, Indonesia",
          arrival_date: "2024-12-15",
          status: "pending"
        },
        {
          id: 2,
          quotation_no: "370443",
          destination: "Tokyo, Japan",
          arrival_date: "2024-12-20",
          status: "confirmed"
        }
      ],
      total: 2
    };
  },

  viewPNL: async (referenceId, quotationNo, currency = 'USD') => {
    await delay(1000);
    console.log('[DEMO MODE] View PNL', { referenceId, quotationNo, currency });

    return {
      quotation_no: quotationNo,
      reference_id: referenceId,
      currency: currency,
      profit: 1500,
      loss: 0,
      total: 1500
    };
  }
};

// Travel Assistant Webhook (DEMO MODE)
export const assistantAPI = {
  sendMessage: async (chatInput, sessionId) => {
    await delay(2000);
    console.log('[DEMO MODE] Send message to assistant', { chatInput, sessionId });

    // Simulate different responses based on input
    const input = chatInput.toLowerCase();

    if (input.includes('days') || input.includes('trip') || input.includes('tour')) {
      const quotationNo = Math.floor(Math.random() * 900000) + 100000;

      return {
        quotation_no: quotationNo.toString(),
        message: "Quotation created successfully",
        output: `Thank you for your inquiry! I've created a quotation for your trip.\n\nQuotation Number: ${quotationNo}\n\nOur team will review your requirements and send you a detailed itinerary with pricing within 24 hours.\n\nWhat you can expect:\n• Customized travel itinerary\n• Best available rates\n• 24/7 customer support\n\nIs there anything specific you'd like to include in your trip?`
      };
    } else {
      return {
        output: `I understand you're interested in: "${chatInput}"\n\nCould you please provide more details about your travel plans?\n\nFor example:\n• Number of days\n• Number of travelers\n• Preferred destinations\n• Travel dates\n• Budget range\n\nThis will help me create the perfect itinerary for you!`
      };
    }
  }
};

// Content APIs (DEMO MODE)
export const contentAPI = {
  getPlaces: async (params = {}) => {
    await delay(800);
    console.log('[DEMO MODE] Get places', params);

    return {
      data: [
        { id: 1, name: "Colombo", type: "city", country: 62 },
        { id: 2, name: "Kandy", type: "city", country: 62 },
        { id: 3, name: "Galle", type: "city", country: 62 }
      ]
    };
  },

  getHotels: async (params = {}) => {
    await delay(800);
    console.log('[DEMO MODE] Get hotels', params);

    return {
      data: [
        { id: 551, name: "Colombo City Hotel", city: 10, class: 4 },
        { id: 1535, name: "Kandy Resort", city: 13, class: 5 }
      ]
    };
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

console.log('[DEMO MODE] ENABLED - Using simulated API responses');
console.log('[INFO] Demo Login Credentials: demo@example.com / Demo1234');
console.log('[INFO] You can register with any email and password');

export default apiServices;
