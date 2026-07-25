// AdminDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AdminHeader } from "./AdminHeader";
import "./assets/styles.css";
import CustomModal from "./CustomModal";
import { clearAuthSession, getAuthHeaders } from "./auth";

const AdminDashboard = () => {
  const location = useLocation();
  const [adminUsername, setAdminUsername] = useState("");
  const [modalType, setModalType] = useState(null);
  const [response, setResponse] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [productManagementView, setProductManagementView] = useState("list");
  const [busyAction, setBusyAction] = useState(null);
  const modalCacheRef = useRef({});

  const cardData = useMemo(() => [
    {
      type: "productManagement",
      title: "Product Management",
      description: "Manage orders and products.",
      team: "Operations",
      modalType: "manageProducts",
      icon: "🛍️",
    },
    { title: "View Profile", description: "View your logged-in admin profile", team: "Account", modalType: "viewProfile", icon: "👤" },
    { title: "View All Users", description: "List all customers", team: "User Management", modalType: "viewAllUsers", icon: "👥" },
    { title: "Modify User", description: "Update user details", team: "User Management", modalType: "modifyUser", icon: "🛠️" },
    { title: "View User Details", description: "Fetch user info", team: "User Management", modalType: "viewUser", icon: "👤" },
    { title: "Overall Revenue", description: "Total business revenue", team: "Analytics", modalType: "overallRevenue", icon: "📈" },
    { title: "Daily Sales", description: "Daily revenue report", team: "Analytics", modalType: "dailySales", icon: "📅" },
    { title: "Monthly Sales", description: "Monthly revenue report", team: "Analytics", modalType: "monthlySales", icon: "🗓️" },
    { title: "Yearly Sales", description: "Yearly revenue report", team: "Analytics", modalType: "yearlySales", icon: "🏆" },
    { title: "Order Management", description: "View all orders", team: "Order Management", modalType: "orders", icon: "📦" },
  ], []);

  const navigate = useNavigate();

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
          headers: {
            ...getAuthHeaders(),
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.role !== "ADMIN") {
            navigate("/admin", { replace: true });
            return;
          }
          setAdminUsername(data.name || data.username || data.user?.name || "Admin");
        } else {
          navigate("/admin", { replace: true });
        }
      } catch {
        navigate("/admin", { replace: true });
      }
    };
    fetchCurrentUser();
  }, [location.state?.username, navigate]);

  // Handlers
  const handleAddProductSubmit = async (productData) => {
    setLoading(true);
    setBusyAction("adding");
    setResponse(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/add`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        setResponse("✅ Product Added Successfully");
        await handleManageProducts(true);
        setProductManagementView("list");
        return true;
      }

      const error = await response.text();
      setResponse(`❌ Failed to save product: ${error}`);
      return false;
    } catch (error) {
      setResponse(`❌ Failed to save product: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
      setBusyAction(null);
    }
  };

  const handleDeleteProductSubmit = async (data) => {
    setLoading(true);
    setBusyAction("deleting");
    try {
      let response = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ productId: data.productId }),
      });

      if (!response.ok && (response.status === 404 || response.status === 405 || response.status === 400)) {
        response = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/delete`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({ productId: data.productId }),
        });
      }

      if (response.ok) {
        setResponse("✅ Product Deleted Successfully");
        setModalData((prev) => (Array.isArray(prev) ? prev.filter((product) => String(product.product_id || product.productId) !== String(data.productId)) : prev));
        return true;
      }

      const error = await response.text();
      setResponse(`❌ Failed to delete product: ${error}`);
      return false;
    } catch (error) {
      setResponse(`❌ Failed to delete product: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
      setBusyAction(null);
    }
  };

  const handleManageProducts = async (preserveResponse = false) => {
    const cached = modalCacheRef.current.products;
    if (cached && !preserveResponse) {
      setModalData(cached);
      return cached;
    }

    setLoading(true);
    if (!preserveResponse) {
      setResponse(null);
    }
    setModalData(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/all`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      if (response.ok) {
        const products = await response.json();
        modalCacheRef.current.products = products;
        setModalData(products);
        return products;
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async () => {
    setLoading(true);
    setResponse(null);
    setModalData(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      if (response.ok) {
        const profile = await response.json();
        setModalData(profile);
        return profile;
      }

      const error = await response.text();
      setResponse(`Error: ${error}`);
      return null;
    } catch (error) {
      setResponse(`Error: ${error.message}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const openModal = async (type, view = "list") => {
    setModalType(type);
    setProductManagementView(view);

    if (type === "manageProducts") {
      await handleManageProducts();
    }

    if (type === "viewProfile") {
      await handleViewProfile();
    }

    if (type === "viewAllUsers") {
      await handleViewAllUsers();
    }

    if (type === "orders") {
      await handleViewOrders();
    }
  };

  const handleUpdateProductSubmit = async (data) => {
    setLoading(true);
    setBusyAction("updating");
    setResponse(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/update`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setResponse("✅ Product Updated Successfully");
        await handleManageProducts(true);
        return true;
      }

      const error = await response.text();
      setResponse(`❌ Failed to update product: ${error}`);
      return false;
    } catch (error) {
      setResponse(`❌ Failed to update product: ${error.message}`);
      return false;
    } finally {
      setLoading(false);
      setBusyAction(null);
    }
  };

  const handleViewUserSubmit = async (data) => {
    setLoading(true);
    setResponse(null);
    setModalData(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/getbyid`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ userId: data.userId }),
      });

      if (response.ok) {
        const userData = await response.json();
        setModalData(userData);
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleModifyUserFetch = async (data) => {
    setLoading(true);
    setResponse(null);
    setModalData(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/getbyid`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ userId: data.userId }),
      });

      if (response.ok) {
        const userData = await response.json();
        setModalData(userData);
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleModifyUserSubmit = async (data) => {
    setLoading(true);
    setResponse(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/modify`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setResponse("User updated successfully!");
        await handleViewAllUsers();
        setModalData(updatedUser);
        setTimeout(() => {
          setModalType(null);
          setResponse(null);
          setModalData(null);
        }, 1800);
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEmailOtp = async (data) => {
    setLoading(true);
    setResponse(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/request-email-update-otp`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ userId: data.userId, newEmail: data.newEmail }),
      });

      if (response.ok) {
        const result = await response.json();
        setResponse(result.message || "OTP sent to new email");
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllUsers = async (data) => {
    const cached = modalCacheRef.current.users;
    if (cached && !data?.forceRefresh) {
      setModalData(cached);
      return cached;
    }

    setLoading(true);
    setResponse(null);
    setModalData(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/all`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      if (response.ok) {
        const users = await response.json();
        modalCacheRef.current.users = users;
        setModalData(users);
        return users;
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleOverallRevenue = async (data) => {
    setLoading(true);
    setResponse(null);
    setModalData(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/business/overall`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      if (response.ok) {
        const revenue = await response.json();
        setModalData(revenue);
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDailySales = async (data) => {
    setLoading(true);
    setResponse(null);
    setModalData(null);
    try {
      const date = data.date || new Date().toISOString().split('T')[0];
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/business/daily?date=${date}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      if (response.ok) {
        const sales = await response.json();
        setModalData(sales);
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthlySales = async (data) => {
    setLoading(true);
    setResponse(null);
    setModalData(null);
    try {
      const month = data.month || new Date().getMonth() + 1;
      const year = data.year || new Date().getFullYear();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/business/monthly?month=${month}&year=${year}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      if (response.ok) {
        const sales = await response.json();
        setModalData(sales);
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleYearlySales = async (data) => {
    setLoading(true);
    setResponse(null);
    setModalData(null);
    try {
      const year = data.year || new Date().getFullYear();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/business/yearly?year=${year}`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      if (response.ok) {
        const sales = await response.json();
        setModalData(sales);
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrders = async (data) => {
    const cached = modalCacheRef.current.orders;
    if (cached && !data?.forceRefresh) {
      setModalData(cached);
      return cached;
    }

    setLoading(true);
    setResponse(null);
    setModalData(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/orders/all`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });

      if (response.ok) {
        const orders = await response.json();
        modalCacheRef.current.orders = orders;
        setModalData(orders);
        return orders;
      } else {
        const error = await response.text();
        setResponse(`Error: ${error}`);
      }
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
    return null;
  };

  const handleLogout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthSession();
      navigate('/', { replace: true });
    }
  };

  return (
    <div className="admin-dashboard">
      <AdminHeader username={adminUsername || "Admin"} />

      <main className="dashboard-content">
        <section className="dashboard-hero">
          <div>
            <p className="dashboard-hero__eyebrow">Operations center</p>
            <h2>Welcome back, {adminUsername || 'Admin'}</h2>
            <p>Manage products, customers, and orders from one polished workspace.</p>
          </div>
        </section>
        <div className="cards-grid">
          {cardData.map((card, index) => (
            card.type === "orderManagement" ? (
              <div key={index} className="card order-management-card" onClick={() => openModal(card.modalType)}>
                <div className="card-content">
                  <div className="card-header-row">
                    <span className="card-icon" aria-hidden="true">{card.icon}</span>
                    <h3 className="card-title">{card.title}</h3>
                  </div>
                  <p className="card-description">{card.description}</p>
                  <span className="card-team">Team: {card.team}</span>
                </div>
                <div className="order-management-actions">
                  <button type="button" className="product-management-action" onClick={(e) => { e.stopPropagation(); openModal("manageProducts", "list"); }}>View Products</button>
                  <button type="button" className="product-management-action secondary" onClick={(e) => { e.stopPropagation(); openModal("manageProducts", "add"); }}>Add Product</button>
                </div>
              </div>
            ) : (
              <div key={index} className="card" onClick={() => openModal(card.modalType)}>
                <div className="card-content">
                  <div className="card-header-row">
                    <span className="card-icon" aria-hidden="true">{card.icon}</span>
                    <h3 className="card-title">{card.title}</h3>
                  </div>
                  <p className="card-description">{card.description}</p>
                  <span className="card-team">Team: {card.team}</span>
                </div>
              </div>
            )
          ))}
        </div>
      </main>

      {modalType && (
        <CustomModal
          modalType={modalType}
          onClose={() => { setModalType(null); setResponse(null); setModalData(null); setProductManagementView("list"); }}
          onSubmit={(data) => {
            switch (modalType) {
              case "addProduct": handleAddProductSubmit(data); break;
              case "deleteProduct": handleDeleteProductSubmit(data); break;
              case "viewUser": handleViewUserSubmit(data); break;
              case "modifyUser":
                if (data?.action === "fetch") {
                  handleModifyUserFetch(data);
                } else if (data?.action === "requestOtp") {
                  handleRequestEmailOtp(data);
                } else {
                  handleModifyUserSubmit(data);
                }
                break;
              case "viewAllUsers": handleViewAllUsers(data); break;
              case "manageProducts":
                if (data?.action === "updateProduct") {
                  handleUpdateProductSubmit(data);
                } else if (data?.action === "deleteProduct") {
                  handleDeleteProductSubmit(data);
                } else {
                  handleManageProducts();
                }
                break;
              case "overallRevenue": handleOverallRevenue(data); break;
              case "dailySales": handleDailySales(data); break;
              case "monthlySales": handleMonthlySales(data); break;
              case "yearlySales": handleYearlySales(data); break;
              case "orders": handleViewOrders(data); break;
              default: break;
            }
          }}
          response={response}
          modalData={modalData}
          loading={loading}
          onUpdateProduct={handleUpdateProductSubmit}
          onDeleteProduct={handleDeleteProductSubmit}
          onRefreshProducts={handleManageProducts}
          onCreateProduct={handleAddProductSubmit}
          productManagementView={productManagementView}
          busyAction={busyAction}
        />
      )}
    </div>
  );
};

export default AdminDashboard;