import React, { Suspense, lazy } from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegistrationPage from "./RegistrationPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import VerifyOtpPage from "./VerifyOtpPage";
const CustomerHomePage = lazy(() => import('./CustomerHomePage'));
const CartPage = lazy(() => import('./CartPage'));
const OrderPage = lazy(() => import('./OrderPage'));
const ProfilePage = lazy(() => import('./ProfilePage'));
const SettingsPage = lazy(() => import('./SettingsPage'));
import AdminLogin from "./AdminLogin"; 
import AdminDashboard from "./AdminDashboard";
const OrderSuccess = lazy(() => import('./components/OrderSuccess'));
const OrderTracking = lazy(() => import('./components/OrderTracking'));
import { isAuthenticated, getStoredAuthToken } from "./auth";

const ProtectedRoute = ({ element, allowedRole }) => {
  const token = getStoredAuthToken();
  if (!token) {
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute element={<LoginPage />} />} />
      <Route path="/register" element={<PublicRoute element={<RegistrationPage />} />} />
      <Route path="/verify-otp" element={<PublicRoute element={<VerifyOtpPage />} />} />
      <Route path="/forgot-password" element={<PublicRoute element={<ForgotPasswordPage />} />} />
      <Route path="/customerhome" element={<ProtectedRoute element={<Suspense fallback={<div/>}><CustomerHomePage /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/UserCartPage" element={<ProtectedRoute element={<Suspense fallback={<div/>}><CartPage /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/orders" element={<ProtectedRoute element={<Suspense fallback={<div/>}><OrderPage /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/profile" element={<ProtectedRoute element={<Suspense fallback={<div/>}><ProfilePage /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/settings" element={<ProtectedRoute element={<Suspense fallback={<div/>}><SettingsPage /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/orders/:orderId/tracking" element={<ProtectedRoute element={<Suspense fallback={<div/>}><OrderTracking /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/order-success" element={<ProtectedRoute element={<Suspense fallback={<div/>}><OrderSuccess /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/order-tracking" element={<ProtectedRoute element={<Suspense fallback={<div/>}><OrderTracking /></Suspense>} allowedRole="CUSTOMER" />} />
      <Route path="/admin" element={<PublicRoute element={<AdminLogin />} />} />
      <Route path="/admindashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRole="ADMIN" />} />
    </Routes>
  );
};

export default AppRoutes;