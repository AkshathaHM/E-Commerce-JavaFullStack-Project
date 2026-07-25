// AdminDashboard.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { AdminHeader } from "./AdminHeader";
import "./assets/styles.css";
import CustomModal from "./CustomModal";
import { clearAuthSession, getAuthHeaders } from "./auth";
import { cachedFetch } from "./utils/apiClient";
import { getCache, setCache } from "./utils/cache";

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
        const data = await cachedFetch('admin_profile', `${import.meta.env.VITE_API_URL}/api/auth/me`, {
          credentials: 'include',
          headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
        }, 30000).catch(() => null);

        if (!data) {
          navigate('/admin', { replace: true });
          return;
        }

        if (data.role !== 'ADMIN') {
          navigate('/admin', { replace: true });
          return;
        }

        setAdminUsername(data.name || data.username || data.user?.name || 'Admin');
      } catch {
        navigate('/admin', { replace: true });
      }
    };
    fetchCurrentUser();
  }, [location.state?.username, navigate, getAuthHeaders]);

  useEffect(() => {
    const prefetchOrders = async () => {
      try {
        await cachedFetch(
          'admin_orders',
          `${import.meta.env.VITE_API_URL}/admin/orders/all`,
          {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          },
          30000,
        );
      } catch (e) {
        // Ignore background prefetch failures.
      }
    };

    prefetchOrders();
  }, [getAuthHeaders]);

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
        setResponse("Product deleted successfully");
        setModalData((prev) => {
          const next = Array.isArray(prev) ? prev.filter((product) => String(product.product_id || product.productId) !== String(data.productId)) : prev;
          try { setCache('admin_products', next, 30000); } catch {}
          return next;
        });
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
    const cacheKey = 'admin_products';
    const cached = getCache(cacheKey) || modalCacheRef.current.products;
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
      const products = await cachedFetch(cacheKey, `${import.meta.env.VITE_API_URL}/admin/products/all`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      }, 30000);

      modalCacheRef.current.products = products;
      setCache(cacheKey, products, 30000);
      setModalData(products);
      return products;
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async () => {
    const cacheKey = 'admin_profile';
    const cached = getCache(cacheKey);
    if (cached) {
      setModalData(cached);
    }

    setLoading(true);
    setResponse(null);
    if (!cached) {
      setModalData(null);
    }
    try {
      const profile = await cachedFetch(cacheKey, `${import.meta.env.VITE_API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      }, 30000).catch(() => null);

      if (!profile) return null;
      setCache(cacheKey, profile, 30000);
      setModalData(profile);
      return profile;
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
        setResponse("Product updated successfully");
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
    const cacheKey = 'admin_users';
    const cached = getCache(cacheKey) || modalCacheRef.current.users;
    if (cached && !data?.forceRefresh) {
      setModalData(cached);
      return cached;
    }
    setLoading(true);
    setResponse(null);
    setModalData(null);
    try {
      const users = await cachedFetch(cacheKey, `${import.meta.env.VITE_API_URL}/admin/user/all`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      }, 30000);

      modalCacheRef.current.users = users;
      setCache(cacheKey, users, 30000);
      setModalData(users);
      return users;
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
      const revenue = await cachedFetch('admin_business_overall', `${import.meta.env.VITE_API_URL}/admin/business/overall`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      }, 30000);

      setModalData(revenue);
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
      const sales = await cachedFetch(`admin_business_daily_${date}`, `${import.meta.env.VITE_API_URL}/admin/business/daily?date=${date}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      }, 30000);

      setModalData(sales);
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
      const sales = await cachedFetch(`admin_business_monthly_${year}_${month}`, `${import.meta.env.VITE_API_URL}/admin/business/monthly?month=${month}&year=${year}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      }, 30000);

      setModalData(sales);
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
      const sales = await cachedFetch(`admin_business_yearly_${year}`, `${import.meta.env.VITE_API_URL}/admin/business/yearly?year=${year}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      }, 30000);

      setModalData(sales);
    } catch (error) {
      setResponse(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrders = async (data) => {
    const cacheKey = 'admin_orders';
    const cached = getCache(cacheKey) || modalCacheRef.current.orders;
    const shouldShowLoading = !cached || data?.forceRefresh;

    if (cached && !data?.forceRefresh) {
      setModalData(cached);
    }

    setLoading(shouldShowLoading);
    setResponse(null);
    if (!shouldShowLoading) {
      setModalData(cached);
    } else {
      setModalData(null);
    }

    try {
      const orders = await cachedFetch(
        cacheKey,
        `${import.meta.env.VITE_API_URL}/admin/orders/all`,
        {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        },
        30000,
      );

      modalCacheRef.current.orders = orders;
      setCache(cacheKey, orders, 30000);
      setModalData(orders);
      return orders;
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
          {cardData.map((card, index) => {
            if (card.type === "productManagement") {
              return (
                <div key={index} className="card order-management-card" onClick={() => navigate('/admin/products')}>
                  <div className="card-content">
                    <div className="card-header-row">
                      <span className="card-icon" aria-hidden="true">{card.icon}</span>
                      <h3 className="card-title">{card.title}</h3>
                    </div>
                    <p className="card-description">{card.description}</p>
                    <span className="card-team">Team: {card.team}</span>
                  </div>
                </div>
              );
            }

            return (
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
            );
          })}
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