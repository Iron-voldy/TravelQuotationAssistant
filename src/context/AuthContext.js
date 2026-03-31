import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react'; // eslint-disable-line react-hooks/exhaustive-deps

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/* ── helpers ── */

// Decode the JWT payload (no signature check) just to read the `exp` claim.
// Returns expiry as a Unix timestamp in milliseconds, or null on failure.
const getTokenExpiryMs = (token) => {
  try {
    const payloadB64 = token.split('.')[1];
    const payload = JSON.parse(atob(payloadB64));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
};

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const refreshTimerRef = useRef(null);

  const clearRefreshTimer = () => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const scheduleRefresh = useCallback((currentToken) => {
    clearRefreshTimer();

    // Calculate delay from actual JWT expiry, using percentage-based buffer
    // For short-lived tokens (< 10 minutes total), refresh at 30% remaining time
    // For longer tokens, refresh at 10 minutes before expiry
    const expiresAt = getTokenExpiryMs(currentToken);
    let refreshDelay;
    
    if (expiresAt) {
      const timeUntilExpiry = expiresAt - Date.now();
      const TEN_MINUTES = 10 * 60 * 1000;
      
      if (timeUntilExpiry < 20 * 60 * 1000) {
        // For tokens expiring in less than 20 minutes, refresh at 70% of lifetime
        refreshDelay = Math.max(timeUntilExpiry * 0.7, 0);
      } else {
        // For longer-lived tokens, refresh 10 minutes before expiry
        refreshDelay = Math.max(timeUntilExpiry - TEN_MINUTES, 0);
      }
    } else {
      // Fallback: if we can't decode the token, refresh in 50 minutes
      refreshDelay = 50 * 60 * 1000;
    }

    console.log(`[AUTH] Token refresh scheduled in ${Math.round(refreshDelay / 1000)}s (${Math.round(refreshDelay / 60000)}m)`);

    const doRefresh = async () => {
      try {
        console.log('[AUTH] Attempting token refresh...');
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log('[AUTH] Token refreshed successfully');
          localStorage.setItem('token', data.token);
          setToken(data.token);
          // If server returned a refreshed Apple token (for agents), persist it
          if (data.appleAccessToken) {
            console.log('[AUTH] Apple token refreshed for agent');
            localStorage.setItem('appleAccessToken', data.appleAccessToken);
          }
          // Schedule the next refresh with the new token
          scheduleRefresh(data.token);
        } else {
          const errorData = await res.json().catch(() => ({}));
          console.warn('[AUTH] Token refresh failed with status:', res.status, errorData);
          
          // If refresh failed, force logout and redirect to login
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('appleAccessToken');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          window.location.href = '/login';
        }
      } catch (e) {
        console.error('[AUTH] Token refresh error:', e.message);
        // Don't logout on network errors, just retry later
        // Schedule a retry attempt in 1 minute
        setTimeout(() => scheduleRefresh(currentToken), 60 * 1000);
      }
    };

    if (refreshDelay === 0) {
      // Token is already expired or very close — refresh immediately
      console.log('[AUTH] Token expiring immediately, refreshing now');
      doRefresh();
    } else {
      refreshTimerRef.current = setTimeout(doRefresh, refreshDelay);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        // Reject outright if the token is already past its expiry time
        const expiresAt = getTokenExpiryMs(storedToken);
        if (expiresAt && Date.now() > expiresAt) {
          console.warn('[AUTH] Stored token is expired on startup. Clearing session.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('appleAccessToken');
          applyTheme(localStorage.getItem('theme') || 'dark');
          setIsLoading(false);
          return;
        }

        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
        scheduleRefresh(storedToken);
        // Apply persisted theme from user data or localStorage fallback
        const savedTheme = userData.theme_preference || localStorage.getItem('theme') || 'dark';
        setTheme(savedTheme);
        applyTheme(savedTheme);
      } catch (e) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      // Not logged in — apply localStorage theme or default
      applyTheme(localStorage.getItem('theme') || 'dark');
    }
    setIsLoading(false);

    return clearRefreshTimer;
  }, [scheduleRefresh]);

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    scheduleRefresh(data.token);

    // Apply theme from server
    const t = data.user.theme_preference || 'dark';
    setTheme(t);
    applyTheme(t);

    return data;
  };

  const agentLogin = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/agent-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Agent login failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.appleAccessToken) {
      localStorage.setItem('appleAccessToken', data.appleAccessToken);
    }
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    scheduleRefresh(data.token);

    // Apply theme from server
    const t = data.user.theme_preference || 'dark';
    setTheme(t);
    applyTheme(t);

    return data;
  };

  const register = async (name, email, password, confirmPassword) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, confirmPassword })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    setIsAuthenticated(true);
    scheduleRefresh(data.token);

    const t = data.user.theme_preference || 'dark';
    setTheme(t);
    applyTheme(t);

    return data;
  };

  const logout = () => {
    clearRefreshTimer();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('appleAccessToken');
    console.log('[AUTH] Logged out. Cleared token, user, appleAccessToken');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    // Reset to dark on logout
    setTheme('dark');
    applyTheme('dark');
  };

  const toggleTheme = async () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    applyTheme(next);
    // Persist to DB if logged in
    if (token) {
      try {
        await fetch(`${API_URL}/auth/me/theme`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ themePreference: next })
        });
        // Update cached user
        const updatedUser = { ...user, theme_preference: next };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error('[AUTH] Theme save failed:', e.message);
      }
    }
  };

  const isAdmin = user?.role === 'admin';
  const isAgent = !!user?.isAgent;

  console.log('[AUTH CONTEXT] User:', user?.email, '| isAgent:', isAgent, '| isAdmin:', isAdmin);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, isLoading, isAdmin, isAgent, theme, login, agentLogin, register, logout, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
