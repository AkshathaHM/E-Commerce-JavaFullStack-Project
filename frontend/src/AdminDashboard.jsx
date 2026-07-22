import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "./Logo";
import CustomModal from "./CustomModal";
import './assets/styles.css';

const AdminDashboard = () => {
  const [adminUsername, setAdminUsername] = useState("");
  const [modalType, setModalType] = useState(null);
  const [response, setResponse] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ... (keep your cardData array)

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/all`, {
        credentials: "include",
        headers: getAuthHeaders()
      });
      if (res.ok) setModalData(await res.json());
    } catch (e) {}
    setLoading(false);
  };

  // Logout with same style as user
  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: getAuthHeaders()
    });
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <Logo />
        <div className="user-info">
          <span>{adminUsername}</span>
          <button onClick={handleLogout} className="logout-button">Logout</button>
        </div>
      </header>

      {/* Your cards grid remains same */}

      {modalType && (
        <CustomModal
          modalType={modalType}
          onClose={() => setModalType(null)}
          response={response}
          modalData={modalData}
          loading={loading}
          onRefreshProducts={fetchAllProducts}
          // ... pass other handlers
        />
      )}
    </div>
  );
};

export default AdminDashboard;