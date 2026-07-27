import React, { Suspense, lazy } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
const LandingPage = lazy(() => import('./LandingPage'));
const LoginPage = lazy(() => import("./LoginPage"));
const RegistrationPage = lazy(() => import("./RegistrationPage"));
const CustomerHomePage = lazy(() => import('./CustomerHomePage'));
const CartPage = lazy(() => import('./CartPage'));
const OrderPage = lazy(() => import('./OrderPage'));
const ProfilePage = lazy(() => import('./ProfilePage'));
const SettingsPage = lazy(() => import('./SettingsPage'));
const AdminLogin = lazy(() => import("./AdminLogin"));
const AdminDashboard = lazy(() => import("./AdminDashboard"));
const AdminProductsPage = lazy(() => import("./AdminProductsPage"));
const OrderSuccess = lazy(() => import('./components/OrderSuccess'));
const OrderTracking = lazy(() => import('./components/OrderTracking'));
import { isAuthenticated } from "./auth";

const ProtectedRoute = ({ element, allowedRole }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  const role = localStorage.getItem("role");
  if (allowedRole && role !== allowedRole) {
    return <Navigate to={role === "ADMIN" ? "/admindashboard" : "/customerhome"} replace />;
  }

  return element;
};

const PublicRoute = ({ element }) => {
  return isAuthenticated() ? <Navigate to={localStorage.getItem("role") === "ADMIN" ? "/admindashboard" : "/customerhome"} replace /> : element;
};

const pageFallback = (
  <div className="app-loading-screen" role="status" aria-live="polite">
    <div className="app-loading-spinner" />
    <p>Loading page…</p>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute element={<Suspense fallback={pageFallback}><LandingPage /></Suspense>} />} />
      <Route path="/login" element={<PublicRoute element={<Suspense fallback={pageFallback}><LoginPage /></Suspense>} />} />
      <Route path="/register" element={<PublicRoute element={<Suspense fallback={pageFallback}><RegistrationPage /></Suspense>} />} />
      <Route path="/verify-otp" element={<PublicRoute element={<Suspense fallback={pageFallback}><LandingPage /></Suspense>} />} />
      <Route path="/forgot-password" element={<PublicRoute element={<Suspense fallback={pageFallback}><LandingPage /></Suspense>} />} />
      <Route path="/customerhome" element={<ProtectedRoute element={<Suspense fallback={pageFallback}><CustomerHomePage /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/UserCartPage" element={<ProtectedRoute element={<Suspense fallback={pageFallback}><CartPage /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/orders" element={<ProtectedRoute element={<Suspense fallback={pageFallback}><OrderPage /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/profile" element={<ProtectedRoute element={<Suspense fallback={pageFallback}><ProfilePage /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/settings" element={<ProtectedRoute element={<Suspense fallback={pageFallback}><SettingsPage /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/orders/:orderId/tracking" element={<ProtectedRoute element={<Suspense fallback={pageFallback}><OrderTracking /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/order-success" element={<ProtectedRoute element={<Suspense fallback={pageFallback}><OrderSuccess /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/order-tracking" element={<ProtectedRoute element={<Suspense fallback={pageFallback}><OrderTracking /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/admin" element={<PublicRoute element={<Suspense fallback={pageFallback}><AdminLogin /></Suspense>} />} />
      <Route path="/admindashboard" element={<ProtectedRoute element={<Suspense fallback={pageFallback}><AdminDashboard /></Suspense>} allowedRole="ADMIN" />} />
      <Route path="/admin/products" element={<ProtectedRoute element={<Suspense fallback={pageFallback}><AdminProductsPage /></Suspense>} allowedRole="ADMIN" />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;