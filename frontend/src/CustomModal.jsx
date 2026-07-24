// CustomModal.jsx
import React, { useState, useEffect } from "react";
import { Toast } from "./Toast";
import "./assets/modalStyles.css";

const toSafeString = (value) => String(value ?? "").trim();
const toSafeLower = (value) => toSafeString(value).toLowerCase();
const isTruthy = (value) => value === true || value === "true" || value === "TRUE";

const CustomModal = ({ modalType, onClose, onSubmit, response, modalData, loading, onUpdateProduct, onDeleteProduct, onRefreshProducts, onCreateProduct, productManagementView, busyAction }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-content ${modalType === "manageProducts" ? "product-management-modal" : modalType === "addProduct" ? "product-form-modal" : ""}`} onClick={(e) => e.stopPropagation()}>
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
            onCreateProduct={onCreateProduct}
            initialAction={productManagementView}
            busyAction={busyAction}
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
const CATEGORY_OPTIONS = [
  { label: "Shirts", value: 1 },
  { label: "Pants", value: 2 },
  { label: "Accessories", value: 3 },
  { label: "Mobiles", value: 4 },
  { label: "Mobile Accessories", value: 5 },
];

const createEmptyProductForm = () => ({
  name: "",
  description: "",
  price: "",
  stock: "",
  categoryId: "",
  brand: "",
  status: "Active",
  imageUrls: [],
});

const ManageProductsForm = ({ onClose, response, modalData, loading, onUpdateProduct, onDeleteProduct, onRefreshProducts, onCreateProduct, initialAction = "list", busyAction }) => {
  const [isFormOpen, setIsFormOpen] = useState(initialAction === "add");
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(createEmptyProductForm());
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewingProduct, setViewingProduct] = useState(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const actionMessage = busyAction === "adding" ? "Adding Product..." : busyAction === "updating" ? "Updating Product..." : busyAction === "deleting" ? "Deleting Product..." : "";

  useEffect(() => {
    if (initialAction === "add") {
      setIsFormOpen(true);
      setEditingProduct(null);
      setFormData(createEmptyProductForm());
    }
  }, [initialAction]);

  useEffect(() => {
    if (!response) return;
    setToast({ show: true, message: response, type: response.toLowerCase().includes("error") ? "error" : "success" });
  }, [response]);

  const openAddForm = () => {
    setViewingProduct(null);
    setConfirmDeleteProduct(null);
    setEditingProduct(null);
    setFormData(createEmptyProductForm());
    setIsFormOpen(true);
  };

  const openEditForm = (product) => {
    setViewingProduct(null);
    setConfirmDeleteProduct(null);
    setEditingProduct(product);
    const categoryMatch = CATEGORY_OPTIONS.find((option) => option.label.toLowerCase() === String(product.category || "").toLowerCase());
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      stock: product.stock ?? "",
      categoryId: product.categoryId || product.category_id || (categoryMatch ? categoryMatch.value : ""),
      brand: product.brand || "",
      status: product.status || "Active",
      imageUrls: Array.isArray(product.images) && product.images.length > 0 ? product.images : [],
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProduct(null);
    setFormData(createEmptyProductForm());
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUrlsChange = (e) => {
    const value = e.target.value;
    const urls = value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, imageUrls: urls }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, itemIndex) => itemIndex !== index) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      categoryId: Number(formData.categoryId),
      imageUrl: formData.imageUrls[0] || "",
      brand: formData.brand,
      status: formData.status,
    };

    let success = false;
    if (editingProduct) {
      payload.productId = Number(editingProduct.product_id || editingProduct.productId);
      success = await onUpdateProduct(payload);
    } else {
      success = await onCreateProduct(payload);
    }

    if (success) {
      closeForm();
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteProduct) return;
    const success = await onDeleteProduct({ productId: Number(confirmDeleteProduct.product_id || confirmDeleteProduct.productId) });
    if (success) {
      setConfirmDeleteProduct(null);
    }
  };

  const products = Array.isArray(modalData) ? modalData : [];
  const filteredProducts = products
    .filter((product) => {
      const productName = `${product.name || ""}`.toLowerCase();
      const productId = `${product.product_id || product.productId || ""}`.toLowerCase();
      const categoryName = `${product.category || ""}`.toLowerCase();
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch = !search || productName.includes(search) || productId.includes(search) || categoryName.includes(search);
      const stockValue = Number(product.stock || 0);
      const matchesFilter = stockFilter === "all" || (stockFilter === "inStock" && stockValue > 0) || (stockFilter === "outOfStock" && stockValue <= 0);
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      const idA = Number(a.product_id || a.productId || 0);
      const idB = Number(b.product_id || b.productId || 0);
      if (sortBy === "oldest") return idA - idB;
      if (sortBy === "priceLow") return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === "priceHigh") return Number(b.price || 0) - Number(a.price || 0);
      return idB - idA;
    });

  const getPreviewImage = (product) => {
    const images = Array.isArray(product.images) ? product.images.filter(Boolean) : [];
    return images[0] || "/images/no-image.png";
  };

  return (
    <div className="manage-products-shell">
      <Toast show={toast.show} message={toast.message} type={toast.type} duration={2800} onClose={() => setToast({ show: false, message: "", type: "success" })} />

      <div className="manage-products-header">
        <div>
          <p className="section-eyebrow">Product management</p>
          <h2>Product Management</h2>
        </div>
        <div className="manage-products-header__actions">
          <button type="button" className="secondary-action-btn" onClick={onRefreshProducts} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button type="button" className="primary-action-btn" onClick={openAddForm}>
            Add Product
          </button>
        </div>
      </div>

      {loading && actionMessage && (
        <div className="loading-overlay">
          <div className="loading-overlay__card">
            <div className="loading-overlay__spinner" />
            <div>{actionMessage}</div>
          </div>
        </div>
      )}

      {!isFormOpen ? (
        <>
          <div className="product-toolbar">
            <label className="product-search">
              <span>🔎</span>
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, ID, or category" />
            </label>
            <div className="product-toolbar__controls">
              <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
                <option value="all">All</option>
                <option value="inStock">In Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="priceLow">Price Low → High</option>
                <option value="priceHigh">Price High → Low</option>
              </select>
            </div>
          </div>

          {loading && !products.length ? (
            <div className="product-grid product-grid--skeleton">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="skeleton-card">
                  <div className="skeleton-image skeleton-block" />
                  <div className="skeleton-stack">
                    <div className="skeleton-line skeleton-block" />
                    <div className="skeleton-line short skeleton-block" />
                    <div className="skeleton-line tiny skeleton-block" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <div key={product.product_id || product.productId} className="product-card">
                  <div className="product-image-wrap">
                    <img src={getPreviewImage(product)} alt={product.name} className="product-image" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/no-image.png"; }} />
                  </div>
                  <div className="product-info">
                    <div className="product-card-body">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-description">{product.description || "Premium product ready for customers."}</p>
                      <div className="admin-product-meta">
                        <span><strong>ID:</strong> {product.product_id || product.productId}</span>
                        <span><strong>Category:</strong> {product.category || "—"}</span>
                        <span><strong>Price:</strong> ₹{Number(product.price || 0).toLocaleString()}</span>
                        <span><strong>Stock:</strong> {product.stock || 0}</span>
                        <span><strong>Status:</strong> {product.status || "Active"}</span>
                        <span><strong>Brand:</strong> {product.brand || "—"}</span>
                      </div>
                    </div>
                    <div className="product-card-footer admin-product-actions">
                      <button type="button" className="product-outline-btn" onClick={() => setViewingProduct(product)}>View</button>
                      <button type="button" className="add-to-cart-btn" onClick={() => openEditForm(product)}>Update</button>
                      <button type="button" className="product-delete-btn" onClick={() => setConfirmDeleteProduct(product)}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="product-empty-state">
              <div className="product-empty-state__icon">📦</div>
              <h3>No products match this view</h3>
              <p>Try a different search term, update the stock filter, or add a new product.</p>
            </div>
          )}
        </>
      ) : (
        <form onSubmit={handleSubmit} className="modern-product-form">
          <div className="modern-product-form__header">
            <h3>{editingProduct ? "Update Product" : "Add Product"}</h3>
            <button type="button" className="secondary-action-btn" onClick={closeForm}>Close</button>
          </div>

          <div className="modern-product-form__grid">
            <div className="modern-product-form__column">
              <label className="modern-form-field">
                <span>Product Name</span>
                <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter product name" required />
              </label>
              <label className="modern-form-field">
                <span>Category</span>
                <select name="categoryId" value={formData.categoryId} onChange={handleChange} required>
                  <option value="">Select category</option>
                  {CATEGORY_OPTIONS.map((category) => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </label>
              <label className="modern-form-field">
                <span>Price</span>
                <input type="number" name="price" value={formData.price} onChange={handleChange} step="0.01" placeholder="0.00" required />
              </label>
              <label className="modern-form-field">
                <span>Stock</span>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} min="0" required />
              </label>
              <label className="modern-form-field">
                <span>Brand</span>
                <input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="Brand name" />
              </label>
            </div>
            <div className="modern-product-form__column">
              <label className="modern-form-field">
                <span>Description</span>
                <textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Describe the product" required />
              </label>
              <label className="modern-form-field">
                <span>Product Status</span>
                <select name="status" value={formData.status} onChange={handleChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
              <label className="modern-form-field">
                <span>Images</span>
                <textarea value={formData.imageUrls.join("\n")} onChange={handleImageUrlsChange} rows="4" placeholder="Paste one image URL per line" />
              </label>
              {formData.imageUrls.length > 0 && (
                <div className="image-preview-list">
                  {formData.imageUrls.map((imageUrl, index) => (
                    <div key={`${imageUrl}-${index}`} className="image-preview-item">
                      <img src={imageUrl} alt={`Preview ${index + 1}`} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/no-image.png"; }} />
                      <span>{imageUrl}</span>
                      <button type="button" className="image-remove-btn" onClick={() => handleRemoveImage(index)}>Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="modern-product-form__footer">
            <button type="button" className="secondary-action-btn" onClick={closeForm}>Cancel</button>
            <button type="submit" className="primary-action-btn" disabled={loading}>
              {loading ? <span className="btn-loading">{editingProduct ? "Updating..." : "Saving..."}</span> : editingProduct ? "Save Product" : "Save Product"}
            </button>
          </div>
        </form>
      )}

      {viewingProduct && (
        <div className="modal-overlay modal-overlay--nested" onClick={() => setViewingProduct(null)}>
          <div className="product-detail-modal" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="modal-close-btn" onClick={() => setViewingProduct(null)}>&times;</button>
            <div className="product-detail-modal__gallery">
              <img src={getPreviewImage(viewingProduct)} alt={viewingProduct.name} />
            </div>
            <div className="product-detail-modal__content">
              <p className="section-eyebrow">Product overview</p>
              <h3>{viewingProduct.name}</h3>
              <p>{viewingProduct.description || "No description available."}</p>
              <div className="product-detail-grid">
                <span><strong>Category:</strong> {viewingProduct.category || "—"}</span>
                <span><strong>Brand:</strong> {viewingProduct.brand || "—"}</span>
                <span><strong>Price:</strong> ₹{Number(viewingProduct.price || 0).toLocaleString()}</span>
                <span><strong>Stock:</strong> {viewingProduct.stock || 0}</span>
                <span><strong>Status:</strong> {viewingProduct.status || "Active"}</span>
                <span><strong>Created:</strong> {viewingProduct.createdAt || "—"}</span>
                <span><strong>Updated:</strong> {viewingProduct.updatedAt || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteProduct && (
        <div className="modal-overlay modal-overlay--nested" onClick={() => setConfirmDeleteProduct(null)}>
          <div className="delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Product?</h3>
            <p>Are you sure want to delete? This action cannot be undone.</p>
            <div className="modern-product-form__footer">
              <button type="button" className="secondary-action-btn" onClick={() => setConfirmDeleteProduct(null)}>Cancel</button>
              <button type="button" className="product-delete-btn" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const pageSize = 5;

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
    if (field === "user") return order?.customerName || order?.user?.username || order?.user?.name || order?.user?.email || order?.userId || order?.user_email || "N/A";
    if (field === "email") return order?.customerEmail || order?.user?.email || order?.email || "N/A";
    if (field === "mobile") return order?.customerMobile || order?.user?.mobileNumber || order?.mobile || order?.phone || "N/A";
    if (field === "address") return order?.customerAddress || order?.address || order?.deliveryAddress || "N/A";
    if (field === "userId") return order?.userId || order?.user?.id || order?.user_id || order?.customerId || order?.customer_id || "N/A";
    if (field === "createdAt") return order?.createdAt || order?.created_at || order?.date || "";
    if (field === "status") return order?.status || order?.orderStatus || order?.order_status || "N/A";
    if (field === "total") return order?.totalAmount ?? order?.total_price ?? order?.amount ?? 0;
    return order?.[field] || "";
  };

  const orders = Array.isArray(modalData)
    ? modalData
    : Array.isArray(modalData?.orders)
      ? modalData.orders
      : [];

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
      <p className="section-subtitle">Live order overview showing customer details and current order status.</p>

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
                  <th style={{width: "40px"}}></th>
                  <th>#</th>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>Address</th>
                  <th>Order ID</th>
                  <th>Status</th>
                  <th>Total</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map((order, index) => {
                  const orderId = order.orderId || order.id;
                  const orderStatus = getOrderValue(order, "status");
                  const badgeClass = toSafeLower(orderStatus).replace(/\s+/g, "-");
                  const rowNumber = (currentPage - 1) * pageSize + index + 1;
                  const isExpanded = expandedOrderId === orderId;

                  return (
                    <React.Fragment key={orderId}>
                      <tr className={isExpanded ? "expanded-row" : ""}>
                        <td style={{width: "40px", textAlign: "center"}}>
                          <button
                            className="expand-btn"
                            onClick={() => setExpandedOrderId(isExpanded ? null : orderId)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              fontSize: "18px",
                              padding: "0",
                            }}
                          >
                            {isExpanded ? "▼" : "▶"}
                          </button>
                        </td>
                        <td>{rowNumber}</td>
                        <td>
                          <div>
                            <strong>{toSafeString(getOrderValue(order, "user"))}</strong>
                            <div>{toSafeString(getOrderValue(order, "email"))}</div>
                          </div>
                        </td>
                        <td>{toSafeString(getOrderValue(order, "mobile"))}</td>
                        <td>{toSafeString(getOrderValue(order, "address"))}</td>
                        <td>{toSafeString(orderId)}</td>
                        <td><span className={`status-badge ${badgeClass}`}>{toSafeString(orderStatus)}</span></td>
                        <td>{formatAmount(getOrderValue(order, "total"))}</td>
                        <td>{toSafeString(getOrderValue(order, "createdAt") || "N/A")}</td>
                      </tr>
                      {isExpanded && (
                        <tr className="order-details-row">
                          <td colSpan="9">
                            <div className="order-details-panel">
                              <div className="details-section">
                                <h3>Order Items</h3>
                                {order.items && order.items.length > 0 ? (
                                  <div className="items-list">
                                    <table className="items-table">
                                      <thead>
                                        <tr>
                                          <th>Product ID</th>
                                          <th>Quantity</th>
                                          <th>Price per Unit</th>
                                          <th>Total</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {order.items.map((item, idx) => (
                                          <tr key={item.id || idx}>
                                            <td>#{item.productId}</td>
                                            <td style={{textAlign: "center"}}>{item.quantity}</td>
                                            <td>{formatAmount(item.pricePerUnit)}</td>
                                            <td><strong>{formatAmount(item.totalPrice)}</strong></td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                    <div className="order-summary">
                                      <div className="summary-row">
                                        <span>Subtotal:</span>
                                        <span>{formatAmount(order.items.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0))}</span>
                                      </div>
                                      <div className="summary-row total-row">
                                        <span>Order Total:</span>
                                        <span>{formatAmount(getOrderValue(order, "total"))}</span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="no-items">No items in this order</p>
                                )}
                              </div>
                              <div className="details-section">
                                <h3>Order Information</h3>
                                <div className="info-grid">
                                  <div className="info-item">
                                    <label>Order ID:</label>
                                    <span>{toSafeString(orderId)}</span>
                                  </div>
                                  <div className="info-item">
                                    <label>Status:</label>
                                    <span className={`status-badge ${badgeClass}`}>{toSafeString(orderStatus)}</span>
                                  </div>
                                  <div className="info-item">
                                    <label>Created:</label>
                                    <span>{toSafeString(getOrderValue(order, "createdAt") || "N/A")}</span>
                                  </div>
                                  <div className="info-item">
                                    <label>Updated:</label>
                                    <span>{toSafeString(order.updatedAt || "N/A")}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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