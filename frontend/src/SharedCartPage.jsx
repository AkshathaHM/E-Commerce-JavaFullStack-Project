import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CustomerLayout } from './CustomerLayout';
import { Toast } from './Toast';
import CartItem from './components/CartItem';
import { getAuthHeaders } from './auth';
import { getCartItemStockLimit } from './utils/cartUtils';
import './CartPage.css';

export default function SharedCartPage() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const shareLink = useMemo(() => {
    if (!shareId) return '';
    if (typeof window === 'undefined') return `/shared-cart/${shareId}`;
    return `${window.location.origin}/shared-cart/${shareId}`;
  }, [shareId]);

  const fetchSharedCart = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/shared-cart/join`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ shareId }),
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/shared-cart/${encodeURIComponent(shareId)}`, {
        credentials: 'include',
        headers: { ...getAuthHeaders() },
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error((body && body.error) || `Unable to load shared cart (${response.status})`);
      }

      const data = await response.json();
      setCartData(data);
    } catch (err) {
      console.error('Shared cart load failed:', err);
      setError(err?.message || 'Unable to load shared cart.');
      setCartData(null);
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    if (!shareId) {
      setError('Invalid shared cart link.');
      setLoading(false);
      return;
    }
    fetchSharedCart();
  }, [fetchSharedCart, shareId]);

  const getItemId = useCallback((item) => {
    const id = item?.product_id ?? item?.productId ?? item?.id ?? null;
    return id != null ? String(id) : null;
  }, []);

  const handleItemUpdate = useCallback(async (productId, quantity) => {
    setActionLoading(true);
    setToastMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shared-cart/${encodeURIComponent(shareId)}/item`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error((body && body.error) || 'Unable to update item.');
      }
      setToastMessage('Shared cart updated.');
      setToastType('success');
      setShowToast(true);
      await fetchSharedCart();
    } catch (err) {
      console.error('Shared cart item update failed:', err);
      setToastMessage(err?.message || 'Failed to update the shared cart item.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setActionLoading(false);
    }
  }, [fetchSharedCart, shareId]);

  const handleQuantityChange = useCallback((productId, delta) => {
    if (!cartData) return;
    const item = (cartData.items || []).find((i) => getItemId(i) === productId);
    if (!item) return;
    const newQty = Math.max(1, Number(item.quantity || 0) + delta);
    if (newQty === item.quantity) return;
    if (item.stock != null && newQty > item.stock) {
      setToastMessage(`Only ${item.stock} item${item.stock === 1 ? '' : 's'} available.`);
      setToastType('error');
      setShowToast(true);
      return;
    }
    handleItemUpdate(productId, newQty);
  }, [cartData, getItemId, handleItemUpdate]);

  const handleRemove = useCallback(async (productId) => {
    setActionLoading(true);
    setToastMessage('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shared-cart/${encodeURIComponent(shareId)}/item`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error((body && body.error) || 'Unable to remove item.');
      }
      setToastMessage('Item removed from shared cart.');
      setToastType('success');
      setShowToast(true);
      await fetchSharedCart();
    } catch (err) {
      console.error('Shared cart item removal failed:', err);
      setToastMessage(err?.message || 'Failed to remove the shared cart item.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setActionLoading(false);
    }
  }, [fetchSharedCart, shareId]);

  const handleCopyShareLink = useCallback(async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      setToastMessage('Invite link copied to clipboard.');
      setToastType('success');
      setShowToast(true);
    } catch (err) {
      setToastMessage('Unable to copy link. Please copy it manually.');
      setToastType('warning');
      setShowToast(true);
    }
  }, [shareLink]);

  const totalItems = useMemo(() => {
    return (cartData?.items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  }, [cartData]);

  const overallTotal = useMemo(() => {
    return (cartData?.items || []).reduce((sum, item) => sum + Number(item.total_price || item.totalPrice || 0), 0).toFixed(2);
  }, [cartData]);

  const handleGoToCart = useCallback(() => navigate('/UserCartPage'), [navigate]);

  return (
    <CustomerLayout username={localStorage.getItem('username') || 'Guest'}>
      <Toast message={toastMessage} show={showToast} type={toastType} onClose={() => setShowToast(false)} />
      <div className="cart-container">
        <div className="cart-page shared-cart-page">
          <div className="cart-header">
            <h2>Shared Cart</h2>
            <p>{cartData?.title || 'Collaborative shopping list'}</p>
          </div>

          {loading ? (
            <div className="cart-items">
              <div className="loading-placeholder">Loading shared cart…</div>
            </div>
          ) : error ? (
            <div className="cart-page empty">
              <h2>Unable to load shared cart</h2>
              <p>{error}</p>
              <button type="button" onClick={() => navigate('/customerhome')}>Back to Home</button>
            </div>
          ) : (
            <>
              <div className="shared-cart-summary">
                <div className="shared-cart-meta">
                  <p><strong>Share ID</strong>: {shareId}</p>
                  <p><strong>Owner</strong>: {cartData?.owner?.name || cartData?.owner?.username}</p>
                  <p><strong>Members</strong>: {(cartData?.members || []).length}</p>
                  <p><strong>Updated</strong>: {cartData?.updated_at || 'N/A'}</p>
                </div>

                <div className="share-link-block">
                  <label>Invite Link</label>
                  <div className="share-link-row">
                    <input readOnly value={shareLink} />
                    <button type="button" onClick={handleCopyShareLink}>Copy link</button>
                  </div>
                </div>
              </div>

              <div className="shared-cart-members">
                <h3>Collaborators</h3>
                <div className="member-list">
                  {(cartData?.members || []).map((member) => (
                    <div className="member-card" key={member.userId}>
                      <strong>{member.name || member.username}</strong>
                      <span>{member.owner ? 'Owner' : 'Member'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {(cartData?.items || []).length === 0 ? (
                <div className="cart-page empty">
                  <h2>The shared cart is empty</h2>
                  <p>Invite someone or add products to start collaborating.</p>
                  <button type="button" onClick={handleGoToCart}>Go to My Cart</button>
                </div>
              ) : (
                <div className="cart-items">
                  {(cartData.items || []).map((item, index) => (
                    <CartItem
                      key={getItemId(item) || index}
                      item={{
                        ...item,
                        display_name: item.name,
                        display_description: item.description,
                        display_image_url: item.image_url || item.imageUrl || '/images/no-image.png'
                      }}
                      onIncrease={() => handleQuantityChange(getItemId(item), +1)}
                      onDecrease={() => handleQuantityChange(getItemId(item), -1)}
                      onRemove={() => handleRemove(getItemId(item))}
                      getItemId={getItemId}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="checkout-section shared-cart-sidebar">
          <h2>Summary</h2>
          <div className="checkout-summary">
            <div className="summary-row"><span>Items</span><span>{totalItems}</span></div>
            <div className="summary-row total"><span>Total</span><span>₹{overallTotal}</span></div>
          </div>
          <button type="button" className="checkout-button" onClick={handleGoToCart} disabled={actionLoading}>Go to My Cart</button>
        </div>
      </div>
    </CustomerLayout>
  );
}
