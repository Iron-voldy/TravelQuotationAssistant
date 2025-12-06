import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

// API Configuration from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://stagev2.appletechlabs.com/api';

// Token refresh helper
const refreshAuthToken = async (currentToken) => {
  try {
    console.log('[TOKEN REFRESH] Attempting to refresh token...');
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[TOKEN REFRESH] Success! New token received');
    return data.access_token;
  } catch (error) {
    console.error('[TOKEN REFRESH] Error:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expiresIn, setExpiresIn] = useState(null);
  const refreshTimeoutRef = useRef(null);

  // Function to set up token refresh timer
  const setupTokenRefreshTimer = useCallback((tokenExpiresIn, currentToken) => {
    // Clear any existing timer
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Refresh token 5 minutes before expiration
    const refreshTime = (tokenExpiresIn - 300) * 1000;
    console.log(`[AUTH] Token refresh scheduled in ${Math.round(refreshTime / 1000)}s`);

    refreshTimeoutRef.current = setTimeout(async () => {
      console.log('[AUTH] Token refresh timer triggered');
      const newToken = await refreshAuthToken(currentToken);
      if (newToken) {
        localStorage.setItem('authToken', newToken);
        setToken(newToken);
        // Reset the timer for the new token (assuming new token also expires in 3600s)
        setupTokenRefreshTimer(3600, newToken);
      } else {
        // If refresh fails, logout
        console.error('[AUTH] Token refresh failed, logging out');
        logout();
      }
    }, refreshTime);
  }, []);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('user');
    const storedExpiresIn = localStorage.getItem('tokenExpiresIn');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
        
        // Set up refresh timer if we have expiration time
        const expiresIn = storedExpiresIn ? parseInt(storedExpiresIn) : 3600;
        setExpiresIn(expiresIn);
        setupTokenRefreshTimer(expiresIn, storedToken);
      } catch (e) {
        console.error('Error restoring session:', e);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('tokenExpiresIn');
      }
    }
    setIsLoading(false);

    // Cleanup on unmount
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [setupTokenRefreshTimer]);

  const login = (userData, authToken, expiresIn = 3600) => {
    console.log('[AUTH] Logging in user:', userData.email);
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('tokenExpiresIn', expiresIn.toString());
    
    setToken(authToken);
    setUser(userData);
    setExpiresIn(expiresIn);
    setIsAuthenticated(true);

    // Set up token refresh timer
    setupTokenRefreshTimer(expiresIn, authToken);
  };

  const logout = () => {
    console.log('[AUTH] Logging out user');
    // Clear refresh timer
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiresIn');
    setToken(null);
    setUser(null);
    setExpiresIn(null);
    setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    token,
    isLoading,
    expiresIn,
    login,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
