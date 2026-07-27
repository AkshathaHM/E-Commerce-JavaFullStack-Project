import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import "./CartPage.css";
import { CustomerLayout } from "./CustomerLayout";
import { Toast } from "./Toast";
import { useNavigate } from "react-router-dom";
import { CartItemSkeleton } from "./components/Skeleton";
import CartItem from "./components/CartItem";
import { getCache, setCache, clearCache } from './utils/cache';
import { cachedFetch, invalidateCache } from './utils/apiClient';
import { getPaymentErrorDetails } from "./utils/paymentFlow";
import { getDerivedOrderStatus, getStatusLabel } from "./utils/orderStatus";
import { useCart } from './CartContext';

const CartPage = () => {
  const { cartItems: sharedCartItems, updateCartState, removeProductFromCart } = useCart();
  const cachedCart = getCache('cart_items');
  const [cartItems, setCartItems] = useState(() => cachedCart?.items || []);
  const [subtotal, setSubtotal] = useState(() => cachedCart?.subtotal || '0.00');
  const [username, setUsername] = useState(() => cachedCart?.username || '');
  const [loading, setLoading] = useState(() => !cachedCart);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showPaymentToast, setShowPaymentToast] = useState(false);
  const [paymentSuccessData, setPaymentSuccessData] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [paymentState, setPaymentState] = useState("idle");
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState(null);
  const [latestOrderStatus, setLatestOrderStatus] = useState(null);
  const checkoutAttemptRef = useRef(0);
  const razorpayScriptRef = useRef(null);
  const navigate = useNavigate();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const totalItems = useMemo(() => cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0), [cartItems]);
  const shipping = "370.00";

  const loadRazorpayScript = async () => {
    if (window.Razorpay) {
      setSdkReady(true);
      setSdkError(null);
      return window.Razorpay;
    }

    if (razorpayScriptRef.current) {
      return new Promise((resolve, reject) => {
        razorpayScriptRef.current.addEventListener('load', () => resolve(window.Razorpay), { once: true });
        razorpayScriptRef.current.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout script')), { once: true });
      });
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => {
        setSdkReady(true);
        setSdkError(null);
        resolve(window.Razorpay);
      };
      script.onerror = () => {
        const message = 'Failed to load Razorpay checkout script';
        setSdkReady(false);
        setSdkError(message);
        reject(new Error(message));
      };
      document.body.appendChild(script);
      razorpayScriptRef.current = script;
    });
  };

  const authTokenExists = () => !!localStorage.getItem("authToken");

  const getItemId = useCallback((item) => {
    const id = item?.product_id ?? item?.productId ?? item?.id ?? null;
    return id != null ? String(id) : null;
  }, []);
  const getDisplayName = useCallback(
    (item) => item?.name || item?.title || item?.productName || item?.product_name || "Product",
    []
  );
  const getDisplayDescription = useCallback(
    (item) =>
      item?.description || item?.desc || item?.shortDescription || item?.product_description || "No description available",
    []
  );
  const getDisplayImageUrl = useCallback(
    (item) => item?.image_url || item?.imageUrl || item?.image || item?.thumbnail || "/images/no-image.png",
    []
  );

  useEffect(() => {
    try {
      const savedOrder = localStorage.getItem('lastOrder');
      if (savedOrder) {
        const parsedOrder = JSON.parse(savedOrder);
        const derivedStatus = getDerivedOrderStatus(parsedOrder?.orderDate || parsedOrder?.createdAt, parsedOrder?.status || 'Order Placed');
        setLatestOrderStatus({
          orderId: parsedOrder?.orderId || 'N/A',
          status: derivedStatus,
          label: getStatusLabel(derivedStatus),
        });
      }
    } catch (error) {
      console.error('Unable to read latest order status:', error);
    }
  }, []);

  // Fetch cart items
  const fetchCartItems = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await cachedFetch('cart_items', `${import.meta.env.VITE_API_URL}/api/cart/items`, {
        credentials: 'include',
        headers: { ...getAuthHeaders() },
      }, 20000);

      if (!data) {
        setCartItems([]);
        setUsername('Guest');
        setSubtotal('0.00');
        return;
      }

      const products = data?.cart?.products || data?.items || [];

      const formatted = products.map((item) => {
        const quantity = Math.max(1, Number(item.quantity || item.qty || 1));
        const pricePerUnit = Number(item.price_per_unit ?? item.price ?? item.unit_price ?? item.pricePerUnit ?? 0);
        const totalPrice = Number(item.total_price ?? item.totalPrice ?? (pricePerUnit * quantity) ?? 0);

        return {
          ...item,
          quantity,
          price_per_unit: Number.isFinite(pricePerUnit) ? pricePerUnit.toFixed(2) : '0.00',
          total_price: Number.isFinite(totalPrice) ? totalPrice.toFixed(2) : '0.00',
          display_name: getDisplayName(item),
          display_description: getDisplayDescription(item),
          display_image_url: getDisplayImageUrl(item),
        };
      });

      const calc = formatted.reduce((sum, item) => sum + Number(item.total_price), 0).toFixed(2);

      setCartItems(formatted);
      setUsername(data?.username || 'Guest');
      setSubtotal(calc);
      updateCartState(formatted);

      try { setCache('cart_items', { items: formatted, username: data?.username || 'Guest', subtotal: calc }, 20000); } catch {}
    } catch (err) {
      console.error('Cart load error:', err);
      setError('Failed to load cart. Please try again.');
      setCartItems([]);
      setUsername('Guest');
      setSubtotal('0.00');
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, getDisplayImageUrl, getDisplayDescription, getDisplayName, updateCartState]);

  useEffect(() => {
    if (!authTokenExists()) {
      setError('Please log in to view your cart.');
      setLoading(false);
      setCartItems([]);
      setUsername('Guest');
      setSubtotal('0.00');
      return;
    }

    const cached = getCache('cart_items');
    if (cached) {
      setCartItems(cached.items || []);
      setUsername(cached.username || 'Guest');
      setSubtotal(cached.subtotal || '0.00');
      setLoading(false);
    }

    if (sharedCartItems.length) {
      setCartItems(sharedCartItems);
      const calc = sharedCartItems.reduce((sum, item) => sum + Number(item.total_price || 0), 0).toFixed(2);
      setSubtotal(calc);
    }

    fetchCartItems({ showLoading: !cached });
  }, [fetchCartItems, sharedCartItems]);

  // Remove item
  const handleRemoveItem = useCallback(async (productId) => {
    const id = productId;
    if (!id) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ username, productId: id }),
      });

      if (res.ok || res.status === 204) {
        const nextItems = cartItems.filter((i) => getItemId(i) !== id);
        const removed = cartItems.find((i) => getItemId(i) === id);
        const newSubtotal = removed ? Math.max(0, Number(subtotal) - Number(removed.total_price)).toFixed(2) : subtotal;

        setCartItems(nextItems);
        setSubtotal(newSubtotal);
        updateCartState(nextItems);
        removeProductFromCart(id);
        try { setCache('cart_items', { items: nextItems, username, subtotal: newSubtotal }, 20000); } catch (e) {}
      } else {
        throw new Error(await res.text() || "Remove failed");
      }
    } catch (err) {
      console.error("Remove failed:", err);
      alert("Could not remove item. Please try again.");
    }
  }, [cartItems, getAuthHeaders, username, subtotal, updateCartState, removeProductFromCart]);

  // Update quantity
  const handleQuantityChange = useCallback(async (productId, delta) => {
    const item = cartItems.find((i) => getItemId(i) === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty <= 0) {
      await handleRemoveItem(productId);
      return;
    }

    const nextItems = cartItems.map((i) =>
      getItemId(i) === productId
        ? { ...i, quantity: newQty, total_price: (Number(i.price_per_unit) * newQty).toFixed(2) }
        : i
    );
    const newSubtotal = nextItems.reduce((sum, item) => sum + Number(item.total_price), 0).toFixed(2);

    setCartItems(nextItems);
    setSubtotal(newSubtotal);
    updateCartState(nextItems);
    try { setCache('cart_items', { items: nextItems, username, subtotal: newSubtotal }, 20000); } catch (e) {}

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/update`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ username, productId, quantity: newQty }),
      });

      if (!res.ok) throw new Error(await res.text() || "Update failed");
    } catch (err) {
      console.error("Qty update failed:", err);
      alert("Could not update quantity. Please try again.");
      fetchCartItems({ showLoading: false });
    }
  }, [cartItems, getAuthHeaders, handleRemoveItem, username, updateCartState]);

  // stable callbacks for child components
  const handleIncrease = useCallback((id) => handleQuantityChange(id, +1), [handleQuantityChange]);
  const handleDecrease = useCallback((id) => handleQuantityChange(id, -1), [handleQuantityChange]);
  const handleRemove = useCallback((id) => handleRemoveItem(id), [handleRemoveItem]);

  const handleCheckout = async () => {
    if (checkoutLoading) return;
    if (Number(subtotal) <= 0) {
      const message = "Your cart is empty or total is zero.";
      setPaymentError({ title: 'Checkout blocked', message, kind: 'empty-cart', canRetry: false });
      setToastMessage(message);
      setToastType("error");
      return;
    }

    setCheckoutLoading(true);
    setPaymentError(null);
    setPaymentState("creating-order");
    checkoutAttemptRef.current += 1;
    const attemptId = checkoutAttemptRef.current;

    try {
      const payload = {
        totalAmount: Number(subtotal),
        cartItems: cartItems.map((item) => ({
          productId: getItemId(item),
          quantity: item.quantity,
          price: Number(item.price_per_unit || item.price || item.unit_price || 0),
        }))
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Server error while creating the payment order");
      }

      const data = await res.json();
      const orderId = data.orderId;
      const amountPaise = data.amountPaise;

      if (!orderId || !amountPaise || amountPaise < 100) {
        throw new Error("Invalid order data received from server");
      }

      const Razorpay = await loadRazorpayScript();
      if (attemptId !== checkoutAttemptRef.current) return;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TAsqtBKY9SkyQb",
        amount: amountPaise,
        currency: "INR",
        name: "SalesSavvy",
        description: "Cart Payment",
        order_id: String(orderId).trim(),
        handler: async (rzpRes) => {
          try {
            setPaymentState("verifying-payment");
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json", ...getAuthHeaders() },
              body: JSON.stringify({
                razorpay_order_id: rzpRes.razorpay_order_id,
                razorpay_payment_id: rzpRes.razorpay_payment_id,
                razorpay_signature: rzpRes.razorpay_signature,
                totalAmount: Number(subtotal),
                cartItems: cartItems.map((item) => ({
                  productId: getItemId(item),
                  quantity: item.quantity,
                  price: Number(item.price_per_unit || item.price || item.unit_price || 0),
                }))
              }),
            });

            let verifyPayload = null;
            try {
              verifyPayload = await verifyRes.json();
            } catch {
              verifyPayload = { error: await verifyRes.text() };
            }

            if (!verifyRes.ok || !verifyPayload?.success) {
              throw new Error(verifyPayload?.error || verifyPayload?.message || "Payment verification failed");
            }

            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + 4);
            const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            });
            const trackingId = `SS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

            const successOrder = {
              orderId: verifyPayload?.orderId || rzpRes.razorpay_order_id,
              paymentId: rzpRes.razorpay_payment_id,
              amount: Number(subtotal).toFixed(2),
              paymentStatus: 'Paid',
              orderDate: new Date().toLocaleString('en-IN'),
              estimatedDelivery: formattedDeliveryDate,
              trackingCode: trackingId,
              totalAmount: Number(subtotal).toFixed(2),
              name: cartItems[0]?.name || 'Order Items',
              imageUrl: cartItems[0]?.image_url || '/images/no-image.png',
              quantity: cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0),
              price: Number(subtotal).toFixed(2),
              deliveryCharges: '0.00',
              tax: '0.00',
            };

            localStorage.setItem('lastOrder', JSON.stringify(successOrder));
            setPaymentSuccessData(successOrder);
            setToastMessage("Payment successful! Your order is being prepared.");
            setToastType("success");
            setShowPaymentToast(true);
            setPaymentError(null);
            setPaymentState("success");
            setCartItems([]);
            setSubtotal("0.00");
            navigate('/order-success', { state: { order: successOrder }, replace: true });
          } catch (e) {
            console.error("Payment verification error:", e);
            const details = getPaymentErrorDetails(e, "Payment processed but verification failed.");
            setPaymentError(details);
            setToastMessage(details.message);
            setToastType("error");
            setPaymentState("failed");
          }
        },
        prefill: {
          name: username || "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        modal: {
          ondismiss: () => {
            const details = getPaymentErrorDetails(new Error('payment cancelled'), 'Payment cancelled.');
            setPaymentError(details.message);
            setToastMessage(details.message);
            setToastType("info");
            setPaymentState("cancelled");
          },
        },
        theme: { color: "#00ABE4" },
        remember_customer: false,
        timeout: 300,
        notes: {
          source: 'web-checkout',
          cart_items: cartItems.length,
        },
      };

      const rzp = new Razorpay(options);
      setPaymentState("opening-checkout");
      try {
        rzp.open();
      } catch (openError) {
        throw new Error(openError?.message || 'Unable to open payment popup. Please allow pop-ups and try again.');
      }
    } catch (err) {
      console.error("Checkout process failed:", err);
      const details = getPaymentErrorDetails(err, err.message || "Something went wrong during checkout.");
      setPaymentError(details);
      setToastMessage(details.message);
      setToastType("error");
      setPaymentState("failed");
    } finally {
      if (checkoutAttemptRef.current === attemptId) {
        setCheckoutLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <CustomerLayout username={username || 'Guest'}>
        <div className="cart-container">
          <div className="cart-page">
            <div className="cart-header">
              <h2>Preparing your cart</h2>
              <p>Fetching the latest items and totals.</p>
            </div>
            <div className="cart-items">
              {Array.from({ length: 3 }).map((_, index) => (
                <CartItemSkeleton key={index} />
              ))}
            </div>
          </div>
          <div className="checkout-section">
            <h2>Order Summary</h2>
            <div className="checkout-summary">
              <div className="summary-row"><span>Subtotal</span><span>₹0.00</span></div>
              <div className="summary-row"><span>Shipping</span><span>₹370.00</span></div>
              <div className="summary-row total"><span>Total</span><span>₹370.00</span></div>
            </div>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  if (error) {
    return (
      <CustomerLayout username={username || 'Guest'}>
        <div className="cart-page empty">
          <h2>{error}</h2>
          <p>Please log in to access your cart items.</p>
          <button onClick={() => navigate("/")}>Go to Login</button>
        </div>
      </CustomerLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <CustomerLayout username={username || 'Guest'}>
        <div className="cart-page empty">
          <h2>Your Cart is Empty</h2>
          <p>Start adding some awesome products!</p>
          <div className="cart-empty-actions">
            <button onClick={() => navigate("/customerhome")}>Continue Shopping</button>
            <button className="cart-empty-secondary" onClick={() => navigate("/profile")}>View Profile</button>
          </div>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout username={username}>
      <Toast
        message={toastMessage || "Payment successful!"}
        show={showPaymentToast}
        type={toastType}
        onClose={() => setShowPaymentToast(false)}
      />
      {paymentError && (
        <div className="payment-error-banner">
          <p>{typeof paymentError === 'string' ? paymentError : paymentError.message}</p>
        </div>
      )}

      <div className="cart-container">
        <div className="cart-page">
          <div className="cart-page-actions">
            <button className="back-button" onClick={() => navigate("/customerhome")}>
              ← Continue Shopping
            </button>

          </div>

          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <p>{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
          </div>

          {latestOrderStatus && (
            <div className="latest-order-status-banner" onClick={() => navigate(`/orders/${encodeURIComponent(latestOrderStatus.orderId)}/tracking`, { state: { order: { orderId: latestOrderStatus.orderId, status: latestOrderStatus.label } } })}>
              <span>Latest order</span>
              <strong>{latestOrderStatus.label}</strong>
              <small>Track #{latestOrderStatus.orderId}</small>
            </div>
          )}

          <div className="cart-items">
            {cartItems.map((item, index) => (
              <CartItem
                key={getItemId(item) || index}
                item={item}
                onIncrease={handleIncrease}
                onDecrease={handleDecrease}
                onRemove={handleRemove}
                getItemId={getItemId}
              />
            ))}
          </div>
        </div>

        <div className="checkout-section">
          <h2>Order Summary</h2>
          <div className="checkout-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>₹{shipping}</span>
            </div>
            <div className="summary-row">
              <span>Total Items</span>
              <span>{totalItems}</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{(Number(subtotal) + Number(shipping)).toFixed(2)}</span>
            </div>

            <button
              className="checkout-button"
              onClick={handleCheckout}
              disabled={checkoutLoading || Number(subtotal) <= 0}
            >
              {checkoutLoading ? (paymentState === "creating-order" ? "Creating Order..." : "Processing Payment...") : "Proceed to Checkout"}
            </button>

            {checkoutLoading && (
              <div className="payment-progress-state" role="status" aria-live="polite">
                <div className="payment-progress-spinner" />
                <span>{paymentState === "creating-order" ? "Creating secure payment order..." : paymentState === "opening-checkout" ? "Opening Razorpay checkout..." : paymentState === "verifying-payment" ? "Verifying payment..." : "Processing Payment..."}</span>
              </div>
            )}

            {sdkError && (
              <div className="payment-error-banner payment-error-banner--inline">
                <p>Unable to load payment gateway. Please check your internet connection.</p>
                <button className="retry-payment-button" type="button" onClick={handleCheckout}>Retry Payment</button>
              </div>
            )}
          </div>
        </div>
      </div>

    </CustomerLayout>
  );
};

export default CartPage;