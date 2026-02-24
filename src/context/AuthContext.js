import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react'; // eslint-disable-line react-hooks/exhaustive-deps

const AuthContext = createContext(null);

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/* ── helpers ── */
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
    // Refresh token 1 hour before 24h expiry (so at 23h mark)
    const refreshDelay = 23 * 60 * 60 * 1000;
    refreshTimerRef.current = setTimeout(async () => {
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
          logout();
        }
      } catch (e) {
        console.error('[AUTH] Token refresh failed:', e.message);
      }
    }, refreshDelay);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
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

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, isLoading, isAdmin, theme, login, register, logout, toggleTheme }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
