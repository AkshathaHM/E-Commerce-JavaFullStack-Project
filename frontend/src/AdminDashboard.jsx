// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Footer } from "./Footer";
import Logo from "./Logo";
import "./assets/styles.css";
import CustomModal from "./CustomModal";

const AdminDashboard = () => {
  const location = useLocation();
  const [adminUsername, setAdminUsername] = useState("");
  const [modalType, setModalType] = useState(null);
  const [response, setResponse] = useState(null);

  const cardData = [
    { title: "Add Product", description: "Create new product", team: "Product Management", modalType: "addProduct" },
    { title: "Delete Product", description: "Remove products", team: "Product Management", modalType: "deleteProduct" },
    { title: "Modify User", description: "Update user details", team: "User Management", modalType: "modifyUser" },
    { title: "View User Details", description: "Fetch user info", team: "User Management", modalType: "viewUser" },
    { title: "Monthly Business", description: "Monthly revenue", team: "Analytics", modalType: "monthlyBusiness" },
    { title: "Day Business", description: "Daily revenue", team: "Analytics", modalType: "dailyBusiness" },
    { title: "Yearly Business", description: "Yearly revenue", team: "Analytics", modalType: "yearlyBusiness" },
    { title: "Overall Business", description: "Total revenue", team: "Analytics", modalType: "overallBusiness" },
  ];

  useEffect(() => {
    const usernameFromState = location.state?.username;
    if (usernameFromState) {
      setAdminUsername(usernameFromState);
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setAdminUsername(data.username || data.user?.name || data.name || "Admin");
        } else {
          setAdminUsername("Admin");
        }
      } catch {
        setAdminUsername("Admin");
      }
    };
    fetchCurrentUser();
  }, [location.state?.username]);

  // Handlers
  const handleAddProductSubmit = async (productData) => { /* ... same as before ... */ };
  const handleDeleteProductSubmit = async ({ productId }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      // rest same
    } catch (error) { console.error(error); }
  };

  const handleViewUserSubmit = async ({ userId }) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/getbyid`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      // rest same
    } catch (error) { console.error(error); }
  };

  const handleModifyUserSubmit = async (data) => { /* already good in your code */ };

  const handleMonthlyBusiness = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/business/monthly?month=${data?.month}&year=${data?.year}`,
        { method: "GET", credentials: "include" }
      );
      // rest same
    } catch (error) { console.error(error); }
  };

  const handleDailyBusiness = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/business/daily?date=${data?.date}`,
        { method: "GET", credentials: "include" }
      );
      // rest same
    } catch (error) { console.error(error); }
  };

  const handleYearlyBusiness = async (data) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/business/yearly?year=${data?.year}`,
        { method: "GET", credentials: "include" }
      );
      // rest same
    } catch (error) { console.error(error); }
  };

  const handleOverallBusiness = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/business/overall`, {
        method: "GET",
        credentials: "include",
      });
      // rest same
    } catch (error) { console.error(error); }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <Logo />
        <div className="user-info">
          <span className="username">{adminUsername || "Admin"}</span>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="cards-grid">
          {cardData.map((card, index) => (
            <div key={index} className="card" onClick={() => setModalType(card.modalType)}>
              <div className="card-content">
                <h3 className="card-title">{card.title}</h3>
                <p className="card-description">{card.description}</p>
                <span className="card-team">Team: {card.team}</span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />

      {modalType && (
        <CustomModal
          modalType={modalType}
          onClose={() => { setModalType(null); setResponse(null); }}
          onSubmit={(data) => {
            switch (modalType) {
              case "addProduct": handleAddProductSubmit(data); break;
              case "deleteProduct": handleDeleteProductSubmit(data); break;
              case "viewUser": handleViewUserSubmit(data); break;
              case "modifyUser": handleModifyUserSubmit(data); break;
              case "monthlyBusiness": handleMonthlyBusiness(data); break;
              case "dailyBusiness": handleDailyBusiness(data); break;
              case "yearlyBusiness": handleYearlyBusiness(data); break;
              case "overallBusiness": handleOverallBusiness(); break;
              default: break;
            }
          }}
          response={response}
        />
      )}
    </div>
  );
};

export default AdminDashboard;