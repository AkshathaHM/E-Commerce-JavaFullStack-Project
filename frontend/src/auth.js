export const AUTH_TOKEN_KEY = 'authToken';
export const USERNAME_KEY = 'username';
export const ROLE_KEY = 'role';
export const SESSION_EXPIRY_KEY = 'authSessionExpiry';
export const SESSION_DURATION_MS = 60 * 60 * 1000;

export const getStoredAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const getSessionExpiry = () => {
  const value = localStorage.getItem(SESSION_EXPIRY_KEY);
  const expiry = Number(value);
  return Number.isNaN(expiry) ? null : expiry;
};

export const isSessionExpired = () => {
  const expiry = getSessionExpiry();
  if (!expiry) return false;
  return Date.now() > expiry;
};

export const isAuthenticated = () => {
  const token = getStoredAuthToken();
  if (!token) {
    clearAuthSession();
    return false;
  }
  if (isSessionExpired()) {
    clearAuthSession();
    return false;
  }
  return true;
};

export const setAuthSession = (token, userData = {}) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(SESSION_EXPIRY_KEY, String(Date.now() + SESSION_DURATION_MS));
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(SESSION_EXPIRY_KEY);
  }

  if (userData.username) {
    localStorage.setItem(USERNAME_KEY, userData.username);
  } else {
    localStorage.removeItem(USERNAME_KEY);
  }

  if (userData.role) {
    localStorage.setItem(ROLE_KEY, userData.role);
  } else {
    localStorage.removeItem(ROLE_KEY);
  }
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USERNAME_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(SESSION_EXPIRY_KEY);
};

export const getDashboardPath = (role) => {
  const normalizedRole = String(role || '').toUpperCase();
  if (normalizedRole === 'ADMIN') return '/admindashboard';
  if (normalizedRole === 'CUSTOMER' || normalizedRole === 'USER') return '/customerhome';
  return '/';
};

export const getAuthHeaders = () => {
  if (isSessionExpired()) {
    clearAuthSession();
    return {};
  }
  const token = getStoredAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
