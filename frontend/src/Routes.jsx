import React from "react";
import { Navigate, Routes, Route } from "react-router-dom";
import LoginPage from "./LoginPage";
import RegistrationPage from "./RegistrationPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import VerifyOtpPage from "./VerifyOtpPage";
import CustomerHomePage from "./CustomerHomePage";
import CartPage from "./CartPage";
import OrderPage from "./OrderPage";
import AdminLogin from "./AdminLogin"; 
import AdminDashboard from "./AdminDashboard";
import OrderSuccess from "./components/OrderSuccess";
import OrderTracking from "./components/OrderTracking";
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
      <Route path="/customerhome" element={<ProtectedRoute element={<CustomerHomePage />} allowedRole="CUSTOMER" />} />
      <Route path="/UserCartPage" element={<ProtectedRoute element={<CartPage />} allowedRole="CUSTOMER" />} />
      <Route path="/orders" element={<ProtectedRoute element={<OrderPage />} allowedRole="CUSTOMER" />} />
      <Route path="/order-success" element={<ProtectedRoute element={<OrderSuccess />} allowedRole="CUSTOMER" />} />
      <Route path="/order-tracking" element={<ProtectedRoute element={<OrderTracking order={{}} />} allowedRole="CUSTOMER" />} />
      <Route path="/admin" element={<PublicRoute element={<AdminLogin />} />} />
      <Route path="/admindashboard" element={<ProtectedRoute element={<AdminDashboard />} allowedRole="ADMIN" />} />
    </Routes>
  );
};

export default AppRoutes;