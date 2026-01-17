import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';

const AuthContext = createContext(null);

// API Configuration from environment
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://stagev2.appletechlabs.com/api';

// Token refresh helper
const refreshAuthToken = async (currentToken) => {
  try {
    console.log('[TOKEN REFRESH] Attempting to refresh token...');
    console.log('[TOKEN REFRESH] Using endpoint:', `${API_BASE_URL}/auth/refresh`);
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${currentToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('[TOKEN REFRESH] Server responded with status:', response.status);
      throw new Error(`Token refresh failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[TOKEN REFRESH] Success! New token received:', {
      hasAccessToken: !!data.access_token,
      expiresIn: data.expires_in
    });
    return data.access_token;
  } catch (error) {
    console.error('[TOKEN REFRESH] Error:', error.message);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [sessionId, setSessionId] = useState(null); // Stable session identifier for n8n
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
      console.log('🔄 ═══════════════════════════════════════════════════');
      console.log('🔄 [TOKEN REFRESH] Timer triggered - refreshing token...');
      console.log('🔄 [TOKEN REFRESH] Old Token:', currentToken);
      console.log('🔄 ═══════════════════════════════════════════════════');
      const newToken = await refreshAuthToken(currentToken);
      if (newToken) {
        console.log('✅ ═══════════════════════════════════════════════════');
        console.log('✅ [TOKEN REFRESH] Token refreshed successfully!');
        console.log('✅ [TOKEN REFRESH] New Token:', newToken);
        console.log('✅ ═══════════════════════════════════════════════════');
        // Update both auth token and sessionId so n8n receives the fresh token
        localStorage.setItem('authToken', newToken);
        localStorage.setItem('sessionId', newToken);
        setToken(newToken);
        setSessionId(newToken);
        // Reset the timer for the new token (assuming new token also expires in 3600s)
        setupTokenRefreshTimer(3600, newToken);
      } else {
        // If refresh fails, logout
        console.error('❌ [TOKEN REFRESH] Token refresh failed, logging out');
        logout();
      }
    }, refreshTime);
  }, []);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedToken = localStorage.getItem('authToken');
    const storedSessionId = localStorage.getItem('sessionId') || storedToken; // fallback to token if legacy
    const storedUser = localStorage.getItem('user');
    const storedExpiresIn = localStorage.getItem('tokenExpiresIn');

    if (storedToken && storedSessionId && storedUser) {
      try {
        setToken(storedToken);
        setSessionId(storedSessionId);
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
    console.log('🔐 ═══════════════════════════════════════════════════');
    console.log('🔐 [LOGIN] User logged in:', userData.email);
    console.log('🔐 [LOGIN] Session ID (Auth Token):', authToken);
    console.log('🔐 [LOGIN] Token expiration time:', expiresIn, 'seconds');
    console.log('🔐 ═══════════════════════════════════════════════════');
    localStorage.setItem('authToken', authToken);
    localStorage.setItem('sessionId', authToken); // keep original token as session id
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('tokenExpiresIn', expiresIn.toString());
    localStorage.setItem('authTokenExpiry', Date.now() + (expiresIn * 1000));
    console.log('[AUTH] Token stored with expiry at:', new Date(Date.now() + (expiresIn * 1000)).toISOString());
    
    setToken(authToken);
    setSessionId(authToken);
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
      localStorage.removeItem('sessionId'); // Clear sessionId on logout
      localStorage.removeItem('user');
      localStorage.removeItem('tokenExpiresIn');
      setToken(null);
      setSessionId(null);
      setUser(null);
      setExpiresIn(null);
      setIsAuthenticated(false);
  };

  const value = {
    isAuthenticated,
    user,
    token,
    sessionId,
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
