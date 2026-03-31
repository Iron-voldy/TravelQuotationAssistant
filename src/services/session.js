const USER_KEY = 'user';
const TOKEN_KEY = 'token';
const APPLE_TOKEN_KEY = 'appleAccessToken';
const LOGIN_PATH_KEY = 'loginPath';

const hasStorage = () => typeof window !== 'undefined' && !!window.localStorage;

export const parseStoredUser = () => {
  if (!hasStorage()) return null;

  const rawUser = localStorage.getItem(USER_KEY);
  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
};

export const getLoginPathForUser = (user, options = {}) => {
  if (options.isAgent || user?.isAgent) return '/agent-login';
  if (user?.role === 'admin') return '/appledevadmin1265';
  return '/login';
};

export const getStoredLoginPath = () => {
  if (!hasStorage()) return '/login';
  return localStorage.getItem(LOGIN_PATH_KEY) || getLoginPathForUser(parseStoredUser());
};

export const persistSession = ({ token, user, appleAccessToken = null, loginPath }) => {
  if (!hasStorage()) return;

  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  if (appleAccessToken) {
    localStorage.setItem(APPLE_TOKEN_KEY, appleAccessToken);
  } else {
    localStorage.removeItem(APPLE_TOKEN_KEY);
  }

  const nextLoginPath = loginPath || getLoginPathForUser(user, { isAgent: !!user?.isAgent });
  localStorage.setItem(LOGIN_PATH_KEY, nextLoginPath);
};

export const clearSession = () => {
  if (!hasStorage()) return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(APPLE_TOKEN_KEY);
  localStorage.removeItem(LOGIN_PATH_KEY);
};
