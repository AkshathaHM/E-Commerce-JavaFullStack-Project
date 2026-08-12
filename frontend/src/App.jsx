import React, { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import './assets/styles.css';
import { ThemeProvider } from './ThemeContext';
import { clearAuthSession, getAuthHeaders, isAuthenticated, isSessionExpired } from './auth';
import ErrorBoundary from './ErrorBoundary';
import { cachedFetch } from './utils/apiClient';
import { getCache, setCache } from './utils/cache';
import { CartProvider } from './CartContext';
const CustomModal = lazy(() => import('./CustomModal'));

// Global profile modal: listens for the `openProfileModal` event and fetches /api/auth/me
function AppWrapper() {
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(() => getCache('profile_me') || null);

  const updateProfile = useCallback(async () => {
    if (!isAuthenticated()) {
      clearAuthSession();
      return;
    }

    try {
      const data = await cachedFetch(
        'profile_me',
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        { credentials: 'include', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } },
        60000,
      );
      if (data) {
        setUserProfile(data);
        setCache('profile_me', data, 60000);
      }
    } catch (error) {
      console.error('profile fetch error', error);
    }
  }, []);

  const handler = useCallback(async (detail) => {
    if (!isAuthenticated()) {
      clearAuthSession();
      setModalType(null);
      detail?.onComplete?.();
      return;
    }

    const cached = getCache('profile_me');
    setModalType('viewProfile');
    if (cached) {
      setModalData(cached);
      setLoading(false);
    } else {
      setModalData(null);
      setLoading(true);
    }

    try {
      const data = await cachedFetch(
        'profile_me',
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        { credentials: 'include', headers: { 'Content-Type': 'application/json', ...getAuthHeaders() } },
        30000,
      );
      if (data) {
        setModalData(data);
        setCache('profile_me', data, 30000);
      }
    } catch (e) {
      console.error('openProfileModal error', e);
    } finally {
      setLoading(false);
      detail?.onComplete?.();
    }
  }, []);

  useEffect(() => {
    const listener = (event) => handler(event.detail);
    window.addEventListener('openProfileModal', listener);
    return () => window.removeEventListener('openProfileModal', listener);
  }, [handler]);

  useEffect(() => {
    const checkSession = () => {
      if (isSessionExpired()) {
        clearAuthSession();
        window.location.pathname = '/';
      }
    };
    checkSession();
    const timer = window.setInterval(checkSession, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!userProfile) {
      updateProfile();
    }
  }, [updateProfile, userProfile]);

  const modalNode = useMemo(() => {
    if (!modalType) return null;
    return (
      <Suspense fallback={null}>
        <CustomModal
          modalType={modalType}
          modalData={modalData}
          loading={loading}
          onClose={() => {
            setModalType(null);
            setModalData(null);
          }}
        />
      </Suspense>
    );
  }, [loading, modalData, modalType]);

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <CartProvider>
          <Router>
            <AppRoutes />
            {modalNode}
          </Router>
        </CartProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

function App() {
  return <AppWrapper />;
}

export default App;