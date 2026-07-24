export const AUTH_TOKEN_KEY = 'authToken';
export const USERNAME_KEY = 'username';
export const ROLE_KEY = 'role';

export const getStoredAuthToken = () => localStorage.getItem(AUTH_TOKEN_KEY);

export const isAuthenticated = () => Boolean(getStoredAuthToken());

export const setAuthSession = (token, userData = {}) => {
  if (token) {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } else {
    localStorage.removeItem(AUTH_TOKEN_KEY);
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
};

export const getDashboardPath = (role) => {
  if (role === 'ADMIN') return '/admindashboard';
  if (role === 'CUSTOMER') return '/customerhome';
  return '/';
};

export const getAuthHeaders = () => {
  const token = getStoredAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
