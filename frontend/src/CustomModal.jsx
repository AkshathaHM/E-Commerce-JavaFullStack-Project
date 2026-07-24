// CustomModal.jsx
import React, { useState, useEffect } from "react";
import "./assets/modalStyles.css";

const toSafeString = (value) => String(value ?? "").trim();
const toSafeLower = (value) => toSafeString(value).toLowerCase();
const isTruthy = (value) => value === true || value === "true" || value === "TRUE";

const CustomModal = ({ modalType, onClose, onSubmit, response, modalData, loading, onUpdateProduct, onDeleteProduct, onRefreshProducts }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>

        {/* Add Product Form */}
        {modalType === "addProduct" && (
          <AddProductForm onSubmit={onSubmit} onClose={onClose} response={response} loading={loading} />
        )}

        {/* Delete Product Form */}
        {modalType === "deleteProduct" && (
          <DeleteProductForm onSubmit={onSubmit} onClose={onClose} response={response} loading={loading} />
        )}

        {/* Manage Products */}
        {modalType === "manageProducts" && (
          <ManageProductsForm
            onClose={onClose}
            response={response}
            modalData={modalData}
            loading={loading}
            onUpdateProduct={onUpdateProduct}
            onDeleteProduct={onDeleteProduct}
            onRefreshProducts={onRefreshProducts}
          />
        )}

        {/* View User Form */}
        {modalType === "viewUser" && (
          <ViewUserForm onSubmit={onSubmit} onClose={onClose} response={response} modalData={modalData} loading={loading} />
        )}

        {/* Modify User Form */}
        {modalType === "modifyUser" && (
          <ModifyUserForm onSubmit={onSubmit} onClose={onClose} response={response} modalData={modalData} loading={loading} />
        )}

        {/* View All Users */}
        {modalType === "viewAllUsers" && (
          <ViewAllUsersForm onSubmit={onSubmit} onClose={onClose} response={response} modalData={modalData} loading={loading} />
        )}

        {/* Overall Revenue */}
        {modalType === "overallRevenue" && (
          <OverallRevenueForm onSubmit={onSubmit} onClose={onClose} response={response} modalData={modalData} loading={loading} />
        )}

        {/* Daily Sales */}
        {modalType === "dailySales" && (
          <DailySalesForm onSubmit={onSubmit} onClose={onClose} response={response} modalData={modalData} loading={loading} />
        )}

        {/* Monthly Sales */}
        {modalType === "monthlySales" && (
          <MonthlySalesForm onSubmit={onSubmit} onClose={onClose} response={response} modalData={modalData} loading={loading} />
        )}

        {/* Yearly Sales */}
        {modalType === "yearlySales" && (
          <YearlySalesForm onSubmit={onSubmit} onClose={onClose} response={response} modalData={modalData} loading={loading} />
        )}

        {/* Orders */}
        {modalType === "orders" && (
          <OrdersForm onSubmit={onSubmit} onClose={onClose} response={response} modalData={modalData} loading={loading} />
        )}
      </div>
    </div>
  );
};

// Manage Products Form Component
const ManageProductsForm = ({ onClose, response, modalData, loading, onUpdateProduct, onDeleteProduct, onRefreshProducts }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    productId: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    imageUrl: "",
  });

  React.useEffect(() => {
    if (selectedProduct) {
      setFormData({
        productId: selectedProduct.product_id || selectedProduct.productId || "",
        name: selectedProduct.name || "",
        description: selectedProduct.description || "",
        price: selectedProduct.price || "",
        stock: selectedProduct.stock || "",
        categoryId: selectedProduct.categoryId || selectedProduct.category_id || "",
        imageUrl: selectedProduct.imageUrl || selectedProduct.image_url || "",
      });
    }
  }, [selectedProduct]);

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    onUpdateProduct({
      productId: parseInt(formData.productId),
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      categoryId: parseInt(formData.categoryId),
      imageUrl: formData.imageUrl,
    });
  };

  const handleDelete = () => {
    if (!selectedProduct) return;
    onDeleteProduct({ productId: parseInt(selectedProduct.product_id || selectedProduct.productId) });
  };

  return (
    <div className="manage-products">
      <h2>Manage Products</h2>
      <div className="modal-form-buttons">
        <button type="button" onClick={onRefreshProducts} disabled={loading}>
          {loading ? "Loading..." : "Refresh Products"}
        </button>
      </div>

      {Array.isArray(modalData) && modalData.length > 0 ? (
        <div className="products-list">
          {modalData.map((product) => (
            <div key={product.product_id || product.productId} className="card product-card">
              <div className="product-card-content">
                <h4>{product.name}</h4>
                <p>ID: {product.product_id || product.productId}</p>
                <p>Price: {product.price}</p>
                <p>Stock: {product.stock}</p>
                <button type="button" onClick={() => handleSelectProduct(product)}>
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No products loaded yet. Click Refresh Products to load products.</p>
      )}

      {selectedProduct && (
        <form onSubmit={handleSubmit} className="modal-form">
          <h3>Edit Product</h3>
          <div className="modal-form-item">
            <label htmlFor="productId">Product ID:</label>
            <input type="text" id="productId" name="productId" value={formData.productId} readOnly />
          </div>
          <div className="modal-form-item">
            <label htmlFor="name">Name:</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="modal-form-item">
            <label htmlFor="description">Description:</label>
            <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows="3" required />
          </div>
          <div className="modal-form-item">
            <label htmlFor="price">Price:</label>
            <input type="number" id="price" name="price" value={formData.price} onChange={handleChange} step="0.01" required />
          </div>
          <div className="modal-form-item">
            <label htmlFor="stock">Stock:</label>
            <input type="number" id="stock" name="stock" value={formData.stock} onChange={handleChange} required />
          </div>
          <div className="modal-form-item">
            <label htmlFor="categoryId">Category ID:</label>
            <input type="number" id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required />
          </div>
          <div className="modal-form-item">
            <label htmlFor="imageUrl">Image URL:</label>
            <input type="url" id="imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />
          </div>
          {response && <div className={`response-message ${response.includes("Error") ? "error" : "success"}`}>{response}</div>}
          <div className="modal-form-buttons">
            <button type="submit" disabled={loading}>{loading ? "Updating..." : "Update Product"}</button>
            <button type="button" onClick={handleDelete} disabled={loading}>{loading ? "Deleting..." : "Delete Product"}</button>
            <button type="button" onClick={() => setSelectedProduct(null)}>Clear</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

// Add Product Form Component
const AddProductForm = ({ onSubmit, onClose, response, loading }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    categoryId: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Convert strings to correct types for backend
    const dataToSubmit = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      imageUrl: formData.imageUrl,
      categoryId: parseInt(formData.categoryId),
    };
    onSubmit(dataToSubmit);
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2>Add Product</h2>
      
      <div className="modal-form-item">
        <label htmlFor="name">Product Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="3"
          required
        ></textarea>
      </div>

      <div className="modal-form-item">
        <label htmlFor="price">Price:</label>
        <input
          type="number"
          id="price"
          name="price"
          value={formData.price}
          onChange={handleChange}
          step="0.01"
          required
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="stock">Stock:</label>
        <input
          type="number"
          id="stock"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          required
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="categoryId">Category ID:</label>
        <input
          type="number"
          id="categoryId"
          name="categoryId"
          value={formData.categoryId}
          onChange={handleChange}
          required
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="imageUrl">Image URL:</label>
        <input
          type="url"
          id="imageUrl"
          name="imageUrl"
          value={formData.imageUrl}
          onChange={handleChange}
        />
      </div>

      {response && (
        <div className={`response-message ${response.includes("Error") ? "error" : "success"}`}>
          {response}
        </div>
      )}

      <div className="modal-form-buttons">
        <button type="submit" disabled={loading}>
          {loading ? "Adding..." : "Add Product"}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

// Delete Product Form Component
const DeleteProductForm = ({ onSubmit, onClose, response, loading }) => {
  const [productId, setProductId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ productId: parseInt(productId) });
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2>Delete Product</h2>

      <div className="modal-form-item">
        <label htmlFor="productId">Product ID:</label>
        <input
          type="number"
          id="productId"
          name="productId"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          required
        />
      </div>

      {response && (
        <div className={`response-message ${response.includes("Error") ? "error" : "success"}`}>
          {response}
        </div>
      )}

      <div className="modal-form-buttons">
        <button type="submit" disabled={loading}>
          {loading ? "Deleting..." : "Delete Product"}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

// View User Form Component
const ViewUserForm = ({ onSubmit, onClose, response, modalData, loading }) => {
  const [userId, setUserId] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedUserId = toSafeString(userId);
    onSubmit({ userId: trimmedUserId });
  };

  const userDetails = modalData || {};
  const statusLabel = isTruthy(userDetails.verified) ? "Verified" : isTruthy(userDetails.enabled) ? "Enabled" : "Inactive";

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2>View User Details</h2>

      <div className="modal-form-item">
        <label htmlFor="userId">User ID:</label>
        <input
          type="text"
          id="userId"
          name="userId"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          placeholder="Enter user ID"
          required
        />
      </div>

      {response && response.includes("Error") && (
        <div className="response-message error">{response}</div>
      )}

      {modalData && (
        <div className="card-list">
          <div className="card small-card">
            <h3>User Details</h3>
            <p><strong>User ID:</strong> {toSafeString(userDetails.userId || userDetails.id || "Not available")}</p>
            <p><strong>Name:</strong> {toSafeString(userDetails.name || userDetails.username || "Not available")}</p>
            <p><strong>Email:</strong> {toSafeString(userDetails.email || "Not available")}</p>
            <p><strong>Phone:</strong> {toSafeString(userDetails.phone || "Not provided")}</p>
            <p><strong>Role:</strong> {toSafeString(userDetails.role || "Not available")}</p>
            <p><strong>Status:</strong> {statusLabel}</p>
            <p><strong>Registration Date:</strong> {toSafeString(userDetails.createdAt || userDetails.registeredAt || "Not available")}</p>
            <p><strong>Orders Count:</strong> {toSafeString(userDetails.ordersCount || userDetails.orderCount || "Not available")}</p>
            <p><strong>Address:</strong> {toSafeString(userDetails.address || "Not provided")}</p>
            <p><strong>Profile Image:</strong> {toSafeString(userDetails.profileImage || userDetails.profile_image || "Not provided")}</p>
          </div>
        </div>
      )}

      <div className="modal-form-buttons">
        <button type="submit" className="secondary-button" disabled={loading}>
          {loading ? "Fetching..." : "Get User"}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

// Modify User Form Component
const ModifyUserForm = ({ onSubmit, onClose, response, modalData, loading }) => {
  const [step, setStep] = useState("fetch");
  const [userId, setUserId] = useState("");
  const [formData, setFormData] = useState({
    userId: "",
    username: "",
    name: "",
    email: "",
    phone: "",
    role: "",
    status: "",
    address: "",
    otp: "",
  });
  const [originalEmail, setOriginalEmail] = useState("");

  React.useEffect(() => {
    if (modalData && modalData.userId) {
      const statusValue = isTruthy(modalData.verified) ? "Verified" : isTruthy(modalData.enabled) ? "Enabled" : "Inactive";
      setFormData({
        userId: modalData.userId,
        username: modalData.username || "",
        name: modalData.name || modalData.username || "",
        email: modalData.email || "",
        phone: modalData.phone || "",
        role: modalData.role || "",
        status: statusValue,
        address: modalData.address || "",
        otp: "",
      });
      setOriginalEmail(modalData.email || "");
      setStep("modify");
    }
  }, [modalData]);

  const handleFetchUser = (e) => {
    e.preventDefault();
    const trimmedUserId = toSafeString(userId);
    onSubmit({ userId: trimmedUserId, action: "fetch" });
  };

  const handleModifyUser = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleRequestOtp = (e) => {
    e.preventDefault();
    onSubmit({
      action: "requestOtp",
      userId: formData.userId,
      newEmail: formData.email,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (step === "fetch") {
    return (
      <form onSubmit={handleFetchUser} className="modal-form">
        <h2>Modify User</h2>

        <div className="modal-form-item">
          <label htmlFor="userId">User ID:</label>
          <input
            type="text"
            id="userId"
            name="userId"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="Enter user ID"
            required
          />
        </div>

        {response && response.includes("Error") && (
          <div className="response-message error">{response}</div>
        )}

        <div className="modal-form-buttons">
          <button type="submit" className="secondary-button" disabled={loading}>
            {loading ? "Fetching..." : "Get User"}
          </button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    );
  }

  const emailChanged = formData.email && formData.email !== originalEmail;

  return (
    <form onSubmit={handleModifyUser} className="modal-form">
      <h2>Modify User</h2>

      <div className="modal-form-item">
        <label htmlFor="userId">User ID:</label>
        <input
          type="text"
          id="userId"
          name="userId"
          value={formData.userId}
          readOnly
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="username">Username:</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="phone">Phone:</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Phone number (if available)"
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="status">Status:</label>
        <input
          type="text"
          id="status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          placeholder="Verified / Enabled / Inactive"
          readOnly
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="address">Address:</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows="2"
          placeholder="Address (if available)"
        />
      </div>

      {emailChanged && (
        <div className="modal-form-item">
          <label htmlFor="otp">Email Change OTP:</label>
          <input
            type="text"
            id="otp"
            name="otp"
            value={formData.otp}
            onChange={handleChange}
            placeholder="Enter OTP sent to new email"
          />
        </div>
      )}

      <div className="modal-form-item">
        <label htmlFor="role">Role:</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          required
        >
          <option value="">Select Role</option>
          <option value="ADMIN">ADMIN</option>
          <option value="CUSTOMER">CUSTOMER</option>
        </select>
      </div>

      {response && (
        <div className={`response-message ${response.includes("Error") ? "error" : "success"}`}>
          {response}
        </div>
      )}

      <div className="modal-form-buttons">
        {emailChanged && (
          <button type="button" disabled={loading} onClick={handleRequestOtp}>
            {loading ? "Sending OTP..." : "Send OTP to New Email"}
          </button>
        )}
        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Update User"}
        </button>
        <button type="button" onClick={() => setStep("fetch")}>Back</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

export default CustomModal;

// View All Users Component
const ViewAllUsersForm = ({ onClose, response, modalData, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");

  const users = Array.isArray(modalData) ? modalData : [];

  const filteredUsers = users.filter((user) => {
    const searchValue = toSafeString(searchTerm).trim().toLowerCase();
    const username = toSafeLower(user.username || user.name || "");
    const email = toSafeLower(user.email || "");
    const userId = toSafeString(user.userId || user.id || "").toLowerCase();
    const role = toSafeLower(user.role || "");
    const matchesSearch = !searchValue || username.includes(searchValue) || email.includes(searchValue) || userId.includes(searchValue);
    const matchesRole = roleFilter === "ALL" || role === toSafeLower(roleFilter);
    return matchesSearch && matchesRole;
  });

  return (
    <div className="modal-form">
      <h2>View All Users</h2>
      <p className="section-subtitle">All registered users are loaded automatically when this modal opens.</p>

      <div className="admin-list-toolbar">
        <input
          type="text"
          placeholder="Search by ID, name, or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="ALL">All Roles</option>
          <option value="CUSTOMER">Customer</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-state">Loading users...</div>
      ) : filteredUsers.length > 0 ? (
        <div className="view-all-users-list">
          {filteredUsers.map((user) => {
            const idValue = user.userId || user.id;
            return (
              <div key={idValue} className="card user-card">
                <h3>{toSafeString(user.username || user.name || "User")}</h3>
                <p><strong>ID:</strong> {toSafeString(idValue)}</p>
                <p><strong>Email:</strong> {toSafeString(user.email || "Not available")}</p>
                <p><strong>Role:</strong> {toSafeString(user.role || "Not available")}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">No users match the current search.</p>
      )}

      {response && response.includes("Error") && (
        <div className="response-message error">{response}</div>
      )}

      <div className="modal-form-buttons">
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

// Overall Revenue Component
const OverallRevenueForm = ({ onSubmit, onClose, response, modalData, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({});
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2>Overall Revenue Report</h2>
      <p>Total revenue from all successful orders</p>

      {modalData && (
        <div className="card small-card">
          <p><strong>Total Revenue:</strong> {modalData.totalRevenue ?? modalData.total_amount ?? 0}</p>
          <p><strong>Successful Orders:</strong> {modalData.orderCount ?? modalData.totalOrders ?? 0}</p>
          {modalData.categorySales && Object.keys(modalData.categorySales).length > 0 && (
            <div className="report-list">
              <h4>Category Sales</h4>
              {Object.entries(modalData.categorySales).map(([category, qty]) => (
                <p key={category}>{category}: {qty}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {response && response.includes("Error") && (
        <div className="response-message error">{response}</div>
      )}

      <div className="modal-form-buttons">
        {!modalData && (
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Get Revenue"}
          </button>
        )}
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

// Daily Sales Component
const DailySalesForm = ({ onSubmit, onClose, response, modalData, loading }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ date });
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2>Daily Sales Report</h2>

      <div className="modal-form-item">
        <label htmlFor="date">Date:</label>
        <input
          type="date"
          id="date"
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      {modalData && (
        <div className="card small-card">
          <p><strong>Date:</strong> {modalData.date || date}</p>
          <p><strong>Total Revenue:</strong> {modalData.totalRevenue ?? modalData.total_amount ?? 0}</p>
          <p><strong>Order Count:</strong> {modalData.orderCount ?? modalData.orders?.length ?? 0}</p>
          {modalData.categorySales && Object.keys(modalData.categorySales).length > 0 && (
            <div className="report-list">
              <h4>Category Sales</h4>
              {Object.entries(modalData.categorySales).map(([category, qty]) => (
                <p key={category}>{category}: {qty}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {response && response.includes("Error") && (
        <div className="response-message error">{response}</div>
      )}

      <div className="modal-form-buttons">
        {!modalData && (
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Get Daily Sales"}
          </button>
        )}
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

// Monthly Sales Component
const MonthlySalesForm = ({ onSubmit, onClose, response, modalData, loading }) => {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ month, year });
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2>Monthly Sales Report</h2>

      <div className="modal-form-item">
        <label htmlFor="month">Month:</label>
        <input
          type="number"
          id="month"
          name="month"
          value={month}
          onChange={(e) => setMonth(parseInt(e.target.value))}
          min="1"
          max="12"
          required
        />
      </div>

      <div className="modal-form-item">
        <label htmlFor="year">Year:</label>
        <input
          type="number"
          id="year"
          name="year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          min="2020"
          max={now.getFullYear() + 1}
          required
        />
      </div>

      {modalData && (
        <div className="card small-card">
          <p><strong>Month:</strong> {modalData.month || month}</p>
          <p><strong>Year:</strong> {modalData.year || year}</p>
          <p><strong>Total Revenue:</strong> {modalData.totalRevenue ?? modalData.total_amount ?? 0}</p>
          <p><strong>Order Count:</strong> {modalData.orderCount ?? modalData.orders?.length ?? 0}</p>
          {modalData.categorySales && Object.keys(modalData.categorySales).length > 0 && (
            <div className="report-list">
              <h4>Category Sales</h4>
              {Object.entries(modalData.categorySales).map(([category, qty]) => (
                <p key={category}>{category}: {qty}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {response && response.includes("Error") && (
        <div className="response-message error">{response}</div>
      )}

      <div className="modal-form-buttons">
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get Monthly Sales"}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

// Yearly Sales Component
const YearlySalesForm = ({ onSubmit, onClose, response, modalData, loading }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ year });
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2>Yearly Sales Report</h2>

      <div className="modal-form-item">
        <label htmlFor="year">Year:</label>
        <input
          type="number"
          id="year"
          name="year"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          min="2020"
          max={now.getFullYear() + 1}
          required
        />
      </div>

      {modalData && (
        <div className="card small-card">
          <p><strong>Year:</strong> {modalData.year || year}</p>
          <p><strong>Total Revenue:</strong> {modalData.totalRevenue ?? modalData.total_amount ?? 0}</p>
          <p><strong>Order Count:</strong> {modalData.orderCount ?? modalData.orders?.length ?? 0}</p>
          {modalData.categorySales && Object.keys(modalData.categorySales).length > 0 && (
            <div className="report-list">
              <h4>Category Sales</h4>
              {Object.entries(modalData.categorySales).map(([category, qty]) => (
                <p key={category}>{category}: {qty}</p>
              ))}
            </div>
          )}
        </div>
      )}

      {response && response.includes("Error") && (
        <div className="response-message error">{response}</div>
      )}

      <div className="modal-form-buttons">
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Get Yearly Sales"}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};

// Orders Component
const OrdersForm = ({ onClose, response, modalData, loading }) => {
  const [localStatus, setLocalStatus] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    try {
      const storedStatus = {};
      for (const key of Object.keys(localStorage)) {
        if (key.startsWith("order-status-")) {
          storedStatus[key.replace("order-status-", "")] = localStorage.getItem(key);
        }
      }
      setLocalStatus(storedStatus);
    } catch {
      setLocalStatus({});
    }
  }, []);

  const updateOrderStatus = (orderId, nextStatus) => {
    const normalized = toSafeLower(nextStatus);
    const statusMap = {
      pending: "PENDING",
      success: "SUCCESS",
      failed: "FAILED",
      placed: "Order Placed",
      shipped: "Shipped",
      transit: "In Transit",
      delivered: "Delivered",
    };

    const nextVisibleStatus = statusMap[normalized] || toSafeString(nextStatus);
    setLocalStatus((prev) => ({ ...prev, [orderId]: nextVisibleStatus }));
    try {
      localStorage.setItem(`order-status-${orderId}`, nextVisibleStatus);
    } catch {
      // ignore storage failures gracefully
    }
  };

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === "") return "N/A";
    const numericValue = typeof value === "number" ? value : Number(value);
    if (Number.isNaN(numericValue)) return toSafeString(value);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const getOrderValue = (order, field) => {
    if (field === "user") return order?.user?.username || order?.user?.name || order?.user?.email || order?.userId || order?.user_email || "N/A";
    if (field === "createdAt") return order?.createdAt || order?.created_at || order?.date || "";
    if (field === "status") return localStatus[order?.orderId || order?.id] || order?.status || "N/A";
    if (field === "total") return order?.totalAmount ?? order?.total_price ?? order?.amount ?? 0;
    return order?.[field] || "";
  };

  const orders = Array.isArray(modalData) ? modalData : [];

  const filteredOrders = orders
    .filter((order) => {
      const searchValue = toSafeLower(searchTerm);
      const userMatch = toSafeLower(getOrderValue(order, "user")).includes(searchValue);
      const orderIdMatch = toSafeLower(order?.orderId || order?.id || "").includes(searchValue);
      const statusValue = toSafeLower(getOrderValue(order, "status"));
      const matchesSearch = !searchValue || userMatch || orderIdMatch;
      const matchesStatus = statusFilter === "ALL" || statusValue.includes(toSafeLower(statusFilter));
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aValue = getOrderValue(a, sortField);
      const bValue = getOrderValue(b, sortField);

      if (sortField === "total") {
        return sortDirection === "asc"
          ? Number(aValue) - Number(bValue)
          : Number(bValue) - Number(aValue);
      }

      return sortDirection === "asc"
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue));
    });

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const orderCount = orders.length;
  const uniqueCustomers = new Set(
    orders.map((order) => getOrderValue(order, "user")).filter((value) => value && value !== "N/A")
  ).size;

  return (
    <div className="modal-form orders-management">
      <h2>Order Management</h2>
      <p className="section-subtitle">Live order overview with quick status updates and a cleaner admin view.</p>

      {loading ? (
        <div className="loading-state">Loading orders...</div>
      ) : orders.length > 0 ? (
        <>
          <div className="orders-summary">
            <div className="summary-pill"><strong>Orders:</strong> {orderCount}</div>
            <div className="summary-pill"><strong>Customers:</strong> {uniqueCustomers}</div>
          </div>

          <div className="admin-list-toolbar">
            <input
              type="text"
              placeholder="Search by order ID or customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="Placed">Order Placed</option>
              <option value="Shipped">Shipped</option>
              <option value="Transit">In Transit</option>
              <option value="Delivered">Delivered</option>
            </select>
            <select value={`${sortField}-${sortDirection}`} onChange={(e) => {
              const [field, direction] = e.target.value.split("-");
              setSortField(field);
              setSortDirection(direction);
            }}>
              <option value="createdAt-desc">Newest first</option>
              <option value="createdAt-asc">Oldest first</option>
              <option value="total-desc">Highest total</option>
              <option value="total-asc">Lowest total</option>
            </select>
          </div>

          <div className="orders-table-wrapper">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, index) => {
                  const orderId = order.orderId || order.id;
                  const orderStatus = localStatus[orderId] || order.status || "N/A";
                  const badgeClass = toSafeLower(orderStatus).replace(/\s+/g, "-");
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;

                  return (
                    <tr key={orderId}>
                      <td>{rowNumber}</td>
                      <td>{getOrderValue(order, "user")}</td>
                      <td>{toSafeString(orderId)}</td>
                      <td><span className={`status-badge ${badgeClass}`}>{toSafeString(orderStatus)}</span></td>
                      <td>{formatAmount(getOrderValue(order, "total"))}</td>
                      <td>{toSafeString(getOrderValue(order, "createdAt") || "N/A")}</td>
                      <td>
                        <select
                          value={toSafeString(orderStatus)}
                          onChange={(e) => updateOrderStatus(orderId, e.target.value)}
                          className="order-status-select"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="SUCCESS">SUCCESS</option>
                          <option value="FAILED">FAILED</option>
                          <option value="Order Placed">Order Placed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="orders-pagination">
            <button type="button" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              Previous
            </button>
            <span>Page {currentPage} of {totalPages}</span>
            <button type="button" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              Next
            </button>
          </div>
        </>
      ) : (
        <div className="empty-state">No orders are available right now.</div>
      )}

      {response && response.includes("Error") && (
        <div className="response-message error">{response}</div>
      )}

      <div className="modal-form-buttons">
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};