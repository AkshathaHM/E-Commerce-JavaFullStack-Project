import React, { useState, useEffect, Suspense, lazy } from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import './assets/styles.css';
import { ThemeProvider } from './ThemeContext';
import { clearAuthSession, isSessionExpired } from './auth';
const CustomModal = lazy(() => import('./CustomModal'));

// Global profile modal: listens for the `openProfileModal` event and fetches /api/auth/me
function AppWrapper() {
  const [modalType, setModalType] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = async (detail) => {
      setLoading(true);
      setModalType(null);
      setModalData(null);
      try {
        const { cachedFetch } = await import('./utils/apiClient');
        const data = await cachedFetch('profile_me', `${import.meta.env.VITE_API_URL}/api/auth/me`, { credentials: 'include', headers: { 'Content-Type': 'application/json' } }, 30000).catch(() => null);
        if (data) {
          setModalData(data);
          setModalType('viewProfile');
        }
      } catch (e) {
        console.error('openProfileModal error', e);
      } finally {
        setLoading(false);
        detail?.onComplete?.();
      }
    };

    const listener = (event) => handler(event.detail);
    window.addEventListener('openProfileModal', listener);
    return () => window.removeEventListener('openProfileModal', listener);
  }, []);

  useEffect(() => {
    const checkSession = () => {
      if (isSessionExpired()) {
        clearAuthSession();
        window.location.hash = '/';
      }
    };

    checkSession();
    const timer = window.setInterval(checkSession, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
        {modalType && (
          <Suspense fallback={null}>
            <CustomModal modalType={modalType} modalData={modalData} loading={loading} onClose={() => { setModalType(null); setModalData(null); }} />
          </Suspense>
        )}
      </Router>
    </ThemeProvider>
  );
}

function App() {
  return <AppWrapper />;
}

export default App;