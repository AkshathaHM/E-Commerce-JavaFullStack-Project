// CustomModal.jsx
import React, { useState, useEffect } from "react";
import "./assets/modalStyles.css";

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
    onSubmit({ userId });
  };

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
            <p><strong>ID:</strong> {modalData.userId}</p>
            <p><strong>Username:</strong> {modalData.username}</p>
            <p><strong>Email:</strong> {modalData.email}</p>
            <p><strong>Role:</strong> {modalData.role}</p>
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
    email: "",
    role: "",
    otp: "",
  });
  const [originalEmail, setOriginalEmail] = useState("");

  React.useEffect(() => {
    if (modalData && modalData.userId) {
      setFormData({
        userId: modalData.userId,
        username: modalData.username || "",
        email: modalData.email || "",
        role: modalData.role || "",
        otp: "",
      });
      setOriginalEmail(modalData.email || "");
      setStep("modify");
    }
  }, [modalData]);

  const handleFetchUser = (e) => {
    e.preventDefault();
    onSubmit({ userId, action: "fetch" });
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
const ViewAllUsersForm = ({ onSubmit, onClose, response, modalData, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({});
  };

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2>View All Users</h2>
      <p>All registered users are loaded automatically when this modal opens. Use the button below to refresh the list.</p>

      {modalData && Array.isArray(modalData) && modalData.length > 0 ? (
        <div className="view-all-users-list">
          {modalData.map((user) => {
            const idValue = user.userId || user.id;
            return (
              <div key={idValue} className="card user-card">
                <h3>{user.username || user.name || "User"}</h3>
                <p><strong>ID:</strong> {idValue}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Role:</strong> {user.role}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="empty-state">No users are loaded yet. Click refresh to load users.</p>
      )}

      {response && response.includes("Error") && (
        <div className="response-message error">{response}</div>
      )}

      <div className="modal-form-buttons">
        <button type="submit" disabled={loading}>
          {loading ? "Refreshing..." : "Get All Users"}
        </button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
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
const OrdersForm = ({ onSubmit, onClose, response, modalData, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({});
  };

  const orders = Array.isArray(modalData) ? modalData : [];
  const userIds = new Set(
    orders.map((order) => {
      if (order?.userId) return order.userId;
      if (order?.user?.id) return order.user.id;
      if (order?.user?.userId) return order.user.userId;
      if (order?.user?.email) return order.user.email;
      if (order?.user_email) return order.user_email;
      return order?.email || null;
    }).filter(Boolean)
  );

  const totalProductCount = orders.reduce((sum, order) => {
    const items = order.orderitems || order.orderItems || [];
    return sum + (Array.isArray(items) ? items.length : 0);
  }, 0);

  return (
    <form onSubmit={handleSubmit} className="modal-form">
      <h2>Order Management</h2>
      <p>View all orders in the system</p>

      {orders.length > 0 && (
        <>
          <div className="orders-summary">
            <p><strong>Order Count:</strong> {orders.length}</p>
            <p><strong>User Count:</strong> {userIds.size}</p>
            <p><strong>Total Product Count:</strong> {totalProductCount}</p>
          </div>
          <div className="orders-list-container">
            {orders.map((order, index) => (
              <div key={order.orderId || order.id || index} className="order-card">
                <div className="order-card-header">
                  <h3>Order #{order.orderId || order.id || index + 1}</h3>
                </div>
                <div className="order-card-body">
                  <div className="order-details">
                    <p><strong>User:</strong> {order.user?.username || order.user?.name || order.user?.email || order.userId || order.user_email || 'N/A'}</p>
                    <p><strong>Status:</strong> {order.status || 'N/A'}</p>
                    <p><strong>Total:</strong> {order.totalAmount ?? order.total_price ?? order.amount ?? 'N/A'}</p>
                    <p><strong>Created:</strong> {order.createdAt || order.created_at || order.date || 'N/A'}</p>
                  </div>
                  {(order.orderitems || order.orderItems) && (
                    <div className="order-items">
                      <h4>Items</h4>
                      {(order.orderitems || order.orderItems).map((item, itemIndex) => (
                        <div key={item.id || item.productId || itemIndex} className="order-item-card">
                          <p><strong>Product ID:</strong> {item.productId || item.product_id || 'N/A'}</p>
                          <p><strong>Quantity:</strong> {item.quantity ?? item.qty ?? 'N/A'}</p>
                          <p><strong>Unit Price:</strong> {item.pricePerUnit ?? item.price ?? 'N/A'}</p>
                          <p><strong>Total:</strong> {item.totalPrice ?? item.total_price ?? 'N/A'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {response && response.includes("Error") && (
        <div className="response-message error">{response}</div>
      )}

      <div className="modal-form-buttons">
        {!modalData && (
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Get All Orders"}
          </button>
        )}
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
};