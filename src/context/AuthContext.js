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

    // Calculate delay from actual JWT expiry, refreshing 5 minutes before it dies.
    // Fall back to 23-hour fixed delay if the token can't be decoded.
    const expiresAt = getTokenExpiryMs(currentToken);
    const FIVE_MINUTES = 5 * 60 * 1000;
    const refreshDelay = expiresAt
      ? Math.max(expiresAt - Date.now() - FIVE_MINUTES, 0)
      : 23 * 60 * 60 * 1000;

    console.log(`[AUTH] Token refresh scheduled in ${Math.round(refreshDelay / 1000)}s`);

    const doRefresh = async () => {
      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${currentToken}` }
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('token', data.token);
          setToken(data.token);
          scheduleRefresh(data.token);
        } else {
          // Refresh endpoint rejected the token — force logout
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          localStorage.removeItem('appleAccessToken');
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          window.location.href = '/login';
        }
      } catch (e) {
        console.error('[AUTH] Token refresh failed:', e.message);
      }
    };

    if (refreshDelay === 0) {
      // Token is already expired or within the 5-minute buffer — refresh immediately
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
