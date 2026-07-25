import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminHeader } from "./AdminHeader";
import "./assets/styles.css";
import { cachedFetch } from "./utils/apiClient";
import { getCache, setCache } from "./utils/cache";
import { getAuthHeaders } from "./auth";
import { Toast } from "./Toast";

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

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialAction = location.state?.initialAction || "list";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(initialAction === "add");
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(createEmptyProductForm());
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewingProduct, setViewingProduct] = useState(null);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [newImageUrl, setNewImageUrl] = useState("");
  const modalCacheRef = useRef({});

  useEffect(() => { fetchProducts(); }, []);

  const fetchProducts = async (preserveResponse = false) => {
    const cacheKey = 'admin_products';
    const cached = getCache(cacheKey) || modalCacheRef.current.products;
    if (cached && !preserveResponse) {
      setProducts(cached);
      return cached;
    }

    setLoading(true);
    if (!preserveResponse) setResponse(null);
    try {
      const data = await cachedFetch(cacheKey, `${import.meta.env.VITE_API_URL}/admin/products/all`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      }, 30000);
      modalCacheRef.current.products = data;
      setCache(cacheKey, data, 30000);
      setProducts(data || []);
      return data;
    } catch (err) {
      setResponse(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductSubmit = async (productData) => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/add`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        setResponse('✅ Product Added Successfully');
        await fetchProducts(true);
        setIsFormOpen(false);
        return true;
      }
      const err = await res.text();
      setResponse(`❌ Failed to save product: ${err}`);
      return false;
    } catch (e) {
      setResponse(`❌ Failed to save product: ${e.message}`);
      return false;
    } finally { setLoading(false); }
  };

  const handleUpdateProductSubmit = async (data) => {
    setLoading(true);
    setResponse(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/update`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setResponse('Product updated successfully');
        await fetchProducts(true);
        return true;
      }
      const err = await res.text();
      setResponse(`❌ Failed to update product: ${err}`);
      return false;
    } catch (e) {
      setResponse(`❌ Failed to update product: ${e.message}`);
      return false;
    } finally { setLoading(false); }
  };

  const handleDeleteProductSubmit = async (data) => {
    setLoading(true);
    setResponse(null);
    try {
      let res = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/delete`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ productId: data.productId }),
      });
      if (!res.ok && (res.status === 404 || res.status === 405 || res.status === 400)) {
        res = await fetch(`${import.meta.env.VITE_API_URL}/admin/products/delete`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
          body: JSON.stringify({ productId: data.productId }),
        });
      }

      if (res.ok) {
        setResponse('Product deleted successfully');
        await fetchProducts({ forceRefresh: true });
        return true;
      }
      const err = await res.text();
      setResponse(`❌ Failed to delete product: ${err}`);
      return false;
    } catch (e) {
      setResponse(`❌ Failed to delete product: ${e.message}`);
      return false;
    } finally { setLoading(false); }
  };

  // Helpers copied from modal implementation
  const stripHtml = (html) => { if (!html) return ""; return String(html).replace(/<[^>]*>/g, "").trim(); };
  const extractImageUrls = (product) => {
    const urls = [];
    if (!product) return urls;
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (!img) return;
        if (typeof img === 'string') urls.push(img);
        else if (img.url) urls.push(img.url);
        else if (img.imageUrl) urls.push(img.imageUrl);
      });
    }
    if (product.imageUrl) urls.push(product.imageUrl);
    if (product.image) urls.push(product.image);
    if (product.image_url) urls.push(product.image_url);
    return urls.filter(Boolean);
  };

  const openAddForm = () => { setViewingProduct(null); setConfirmDeleteProduct(null); setEditingProduct(null); setFormData(createEmptyProductForm()); setIsFormOpen(true); };

  const openEditForm = (product) => {
    setViewingProduct(null); setConfirmDeleteProduct(null); setEditingProduct(product);
    const cleanedDescription = stripHtml(product.description || product.desc || "");
    const images = extractImageUrls(product);
    setFormData({
      name: product.name || product.title || product.productName || "",
      description: cleanedDescription,
      price: product.price ?? product.amount ?? "",
      stock: product.stock ?? product.quantity ?? "",
      categoryId: product.categoryId || product.category_id || "",
      brand: product.brand || product.manufacturer || "",
      status: product.status || "Active",
      imageUrls: images,
    });
    setIsFormOpen(true);
  };

  const closeForm = () => { setIsFormOpen(false); setEditingProduct(null); setFormData(createEmptyProductForm()); };

  const handleAddImageUrl = () => {
    const url = (newImageUrl || '').trim(); if (!url) return; setFormData(prev => ({ ...prev, imageUrls: [url, ...prev.imageUrls] })); setNewImageUrl('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => { const dataUrl = reader.result; setFormData(prev => ({ ...prev, imageUrls: [dataUrl, ...prev.imageUrls] })); }; reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => setFormData((prev) => ({ ...prev, imageUrls: prev.imageUrls.filter((_, itemIndex) => itemIndex !== index) }));

  const submitForm = async (e) => {
    e && e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      stock: parseInt(formData.stock, 10) || 0,
      categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
      imageUrl: formData.imageUrls && formData.imageUrls.length ? formData.imageUrls[0] : "",
      brand: formData.brand,
      status: formData.status,
    };

    let success = false;
    if (editingProduct) {
      payload.productId = Number(editingProduct.product_id || editingProduct.productId || editingProduct.id);
      success = await handleUpdateProductSubmit(payload);
    } else {
      success = await handleAddProductSubmit(payload);
    }

    if (success) {
      setIsFormOpen(false); setEditingProduct(null); setFormData(createEmptyProductForm()); setViewingProduct(null); setConfirmDeleteProduct(null); await fetchProducts(true);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteProduct) return;
    const success = await handleDeleteProductSubmit({ productId: Number(confirmDeleteProduct.product_id || confirmDeleteProduct.productId || confirmDeleteProduct.id) });
    if (success) { setConfirmDeleteProduct(null); setViewingProduct(null); await fetchProducts({ forceRefresh: true }); }
  };

  const getPreviewImage = (product) => {
    const candidates = [];
    if (Array.isArray(product.images)) candidates.push(...product.images);
    if (product.imageUrl) candidates.push(product.imageUrl);
    if (product.image) candidates.push(product.image);
    if (product.image_url) candidates.push(product.image_url);
    const images = candidates.filter(Boolean);
    return images[0] || "/images/no-image.png";
  };

  const getDisplayName = (product) => product.name || product.title || product.productName || product.product_name || "Untitled Product";
  const getDisplayDescription = (product) => product.description || product.desc || product.shortDescription || "Premium product ready for customers.";

  const filteredProducts = (Array.isArray(products) ? products : [])
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

  return (
    <div className="admin-products-page">
      <AdminHeader username={localStorage.getItem('username') || 'Admin'} />

      <main className="dashboard-content">
        <div className="manage-products-shell">
          <Toast show={toast.show} message={toast.message} type={toast.type} duration={2800} onClose={() => setToast({ show: false, message: '', type: 'success' })} />

          <div className="manage-products-header">
            <div>
              <p className="section-eyebrow">Product management</p>
              <h2>Product Management</h2>
            </div>
            <div className="manage-products-header__actions">
              <button type="button" className="secondary-action-btn" onClick={() => navigate('/admindashboard')}>Back to Dashboard</button>
              {!isFormOpen && (
                <button type="button" className="primary-action-btn" onClick={openAddForm}>Add Product</button>
              )}
            </div>
          </div>

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

              {filteredProducts.length > 0 ? (
                <div className="product-grid">
                  {filteredProducts.map((product) => (
                    <div key={product.product_id || product.productId || product.id} className="product-card">
                      <div className="product-image-wrap">
                        <img src={getPreviewImage(product)} alt={getDisplayName(product)} className="product-image" loading="lazy" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/no-image.png"; }} />
                      </div>
                      <div className="product-info">
                        <div className="product-card-body">
                          <div className="product-card-heading">
                            <h3 className="product-name">{getDisplayName(product)}</h3>
                            <span className={`product-card-status ${((product.status||"") + "").toLowerCase().includes("inactive") ? 'product-card-status--inactive' : ''}`}>{product.status || "Active"}</span>
                          </div>
                          <p className="product-description">{getDisplayDescription(product)}</p>
                          <div className="admin-product-meta">
                            <span><strong>ID</strong><span className="meta-value">{product.product_id || product.productId || product.id}</span></span>
                            <span><strong>Category</strong><span className="meta-value">{product.category || product.categoryName || "—"}</span></span>
                            <span><strong>Price</strong><span className="meta-value">₹{Number(product.price || product.amount || 0).toLocaleString()}</span></span>
                            <span><strong>Stock</strong><span className="meta-value">{product.stock || product.quantity || 0}</span></span>
                            <span><strong>Status</strong><span className="meta-value">{product.status || "Active"}</span></span>
                            <span><strong>Brand</strong><span className="meta-value">{product.brand || product.manufacturer || "—"}</span></span>
                          </div>
                        </div>
                        <div className="product-card-footer admin-product-actions">
                          <button type="button" className="product-view-btn" onClick={() => setViewingProduct(product)}>View</button>
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
            <div className="modal-overlay modal-overlay--nested form-overlay" onClick={closeForm}>
              <div className="modal-content modal-content--nested" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={submitForm} className="modern-product-form">
                  <div className="modern-product-form__header">
                    <h3>{editingProduct ? "Update Product" : "Add Product"}</h3>
                    <button type="button" className="secondary-action-btn" onClick={closeForm}>Close</button>
                  </div>

                  <div className="modern-product-form__grid">
                    <div className="modern-product-form__column">
                      <label className="modern-form-field">
                        <span>Product Name</span>
                        <input type="text" name="name" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter product name" required />
                      </label>
                      <label className="modern-form-field">
                        <span>Category</span>
                        <select name="categoryId" value={formData.categoryId} onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))} required>
                          <option value="">Select category</option>
                          {CATEGORY_OPTIONS.map((category) => (
                            <option key={category.value} value={category.value}>{category.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="modern-form-field">
                        <span>Price</span>
                        <input type="number" name="price" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} step="0.01" placeholder="0.00" required />
                      </label>
                      <label className="modern-form-field">
                        <span>Stock</span>
                        <input type="number" name="stock" value={formData.stock} onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))} min="0" required />
                      </label>
                      <label className="modern-form-field">
                        <span>Brand</span>
                        <input type="text" name="brand" value={formData.brand} onChange={(e) => setFormData(prev => ({ ...prev, brand: e.target.value }))} placeholder="Brand name" />
                      </label>
                    </div>
                    <div className="modern-product-form__column">
                      <label className="modern-form-field">
                        <span>Description</span>
                        <textarea name="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows="4" placeholder="Describe the product" required />
                      </label>
                      <label className="modern-form-field">
                        <span>Product Status</span>
                        <select name="status" value={formData.status} onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </label>
                      <label className="modern-form-field">
                        <span>Images</span>
                        <div className="image-input-row">
                          <input type="text" placeholder="Add image URL" value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
                          <button type="button" className="secondary-action-btn" onClick={handleAddImageUrl}>Add</button>
                        </div>
                        <div className="image-input-row">
                          <input type="file" accept="image/*" onChange={handleFileChange} />
                        </div>
                      </label>
                      {formData.imageUrls && formData.imageUrls.length > 0 && (
                        <div className="image-preview-list">
                          {formData.imageUrls.map((imageUrl, index) => (
                            <div key={`${imageUrl}-${index}`} className="image-preview-item">
                              <img src={imageUrl} alt={`Preview ${index + 1}`} onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "/images/no-image.png"; }} />
                              <div className="image-preview-actions">
                                <button type="button" className="image-remove-btn" onClick={() => handleRemoveImage(index)}>Remove</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="modern-product-form__footer">
                    <button type="button" className="secondary-action-btn" onClick={closeForm}>Cancel</button>
                    <button type="submit" className="primary-action-btn" disabled={loading}>{loading ? (editingProduct ? 'Updating...' : 'Saving...') : (editingProduct ? 'Update Product' : 'Save Product')}</button>
                  </div>
                </form>
              </div>
            </div>
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
      </main>
    </div>
  );
};

export default AdminProductsPage;
