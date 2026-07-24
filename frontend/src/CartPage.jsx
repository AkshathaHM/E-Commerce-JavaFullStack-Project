import React, { useEffect, useRef, useState } from "react";
import "./CartPage.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toast } from "./Toast";
import { useNavigate } from "react-router-dom";
import { CartItemSkeleton } from "./components/Skeleton";
import { getPaymentErrorDetails } from "./utils/paymentFlow";

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState("0.00");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
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
  const checkoutAttemptRef = useRef(0);
  const razorpayScriptRef = useRef(null);
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

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

  // Fetch cart items
  useEffect(() => {
    if (!authTokenExists()) {
      setError('Please log in to view your cart.');
      setLoading(false);
      setCartItems([]);
      setUsername('Guest');
      setSubtotal('0.00');
      return;
    }

    setLoading(true);
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/items`, {
        credentials: "include",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!res.ok) {
        const errText = await res.text();
        if (res.status === 401) {
          setError("Please log in to view your cart.");
          setCartItems([]);
          setUsername("Guest");
          setSubtotal("0.00");
          return;
        }
        throw new Error(`Cart fetch failed: ${errText}`);
      }

      const data = await res.json();
      const products = data?.cart?.products || [];

      const formatted = products.map((item) => ({
        ...item,
        price_per_unit: Number(item.price_per_unit || 0).toFixed(2),
        total_price: Number(item.total_price || 0).toFixed(2),
      }));

      setCartItems(formatted);
      setUsername(data?.username || "Guest");

      const calc = formatted
        .reduce((sum, item) => sum + Number(item.total_price), 0)
        .toFixed(2);

      setSubtotal(calc);
    } catch (err) {
      console.error("Cart load error:", err);
      setError("Failed to load cart. Please try again.");
      setCartItems([]);
      setUsername("Guest");
      setSubtotal("0.00");
    } finally {
      setLoading(false);
    }
  };

  // Remove item
  const handleRemoveItem = async (productId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/delete`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ username, productId }),
      });

      if (res.ok || res.status === 204) {
        setCartItems((prev) => prev.filter((i) => i.product_id !== productId));

        const removed = cartItems.find((i) => i.product_id === productId);
        if (removed) {
          const newSub = (Number(subtotal) - Number(removed.total_price)).toFixed(2);
          setSubtotal(newSub > 0 ? newSub : "0.00");
        }
      } else {
        throw new Error(await res.text() || "Remove failed");
      }
    } catch (err) {
      console.error("Remove failed:", err);
      alert("Could not remove item. Please try again.");
    }
  };

  // Update quantity
  const handleQuantityChange = async (productId, delta) => {
    const item = cartItems.find((i) => i.product_id === productId);
    if (!item) return;

    const newQty = item.quantity + delta;
    if (newQty < 0) return;
    if (newQty === 0) return handleRemoveItem(productId);

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/cart/update`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ username, productId, quantity: newQty }),
      });

      if (!res.ok) throw new Error(await res.text() || "Update failed");

      setCartItems((prev) =>
        prev.map((i) =>
          i.product_id === productId
            ? { ...i, quantity: newQty, total_price: (Number(i.price_per_unit) * newQty).toFixed(2) }
            : i
        )
      );

      setSubtotal((prev) => {
        const diff = Number(item.price_per_unit) * delta;
        const next = (Number(prev) + diff).toFixed(2);
        return next > 0 ? next : "0.00";
      });
    } catch (err) {
      console.error("Qty update failed:", err);
      alert("Could not update quantity. Please try again.");
    }
  };

  const handleCheckout = async () => {
    if (checkoutLoading) return;
    if (Number(subtotal) <= 0) {
      const message = "Your cart is empty or total is zero.";
      setPaymentError(message);
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
          productId: item.product_id,
          quantity: item.quantity,
          price: Number(item.price_per_unit)
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
        key: "rzp_test_TAsqtBKY9SkyQb",
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
                  productId: item.product_id,
                  quantity: item.quantity,
                  price: Number(item.price_per_unit)
                }))
              }),
            });

            if (!verifyRes.ok) {
              const verifyMessage = await verifyRes.text();
              throw new Error(verifyMessage || "Payment verification failed");
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
              orderId: rzpRes.razorpay_order_id,
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
            setPaymentError(details.message);
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
      setPaymentError(details.message);
      setToastMessage(details.message);
      setToastType("error");
      setPaymentState("failed");
    } finally {
      if (checkoutAttemptRef.current === attemptId) {
        setCheckoutLoading(false);
      }
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const shipping = "370.00";


  if (loading) {
    return (
      <div className="cart-page loading-shell">
        <Header cartCount="0" username={username || 'Guest'} />
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
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="cart-page empty">
        <Header cartCount="0" username={username || 'Guest'} />
        <h2>{error}</h2>
        <p>Please log in to access your cart items.</p>
        <button onClick={() => navigate("/")}>Go to Login</button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-page empty">
        <Header cartCount="0" username={username || 'Guest'} />
        <h2>Your Cart is Empty</h2>
        <p>Start adding some awesome products!</p>
        <button onClick={() => navigate("/customerhome")}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div style={{ width: "100vw", minHeight: "100vh" }}>
      <Toast
        message={toastMessage || "Payment successful!"}
        show={showPaymentToast}
        type={toastType}
        onClose={() => setShowPaymentToast(false)}
      />
      <Header cartCount={totalItems} username={username} />


      {paymentError && (
        <div className="payment-error-banner">
          <p>{paymentError}</p>
        </div>
      )}

      <div className="cart-container">
        <div className="cart-page">
          <button className="back-button" onClick={() => navigate("/customerhome")}>
            ← Continue Shopping
          </button>

          <div className="cart-header">
            <h2>Shopping Cart</h2>
            <p>{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
          </div>

          <div className="cart-items">
            {cartItems.map((item) => (
              <div key={item.product_id} className="cart-item">
                <img
                  src={item.image_url?.startsWith("http") ? item.image_url : "/images/no-image.png"}
                  alt={item.name || "Product"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/no-image.png";
                  }}
                />
                <div className="item-details">
                  <div className="item-info">
                    <h3>{item.name}</h3>
                    <p>{item.description || "No description available"}</p>
                  </div>

                  <div className="item-actions">
                    <div className="quantity-controls">
                      <button onClick={() => handleQuantityChange(item.product_id, -1)} disabled={item.quantity <= 1}>−</button>
                      <span className="quantity-display">{item.quantity}</span>
                      <button onClick={() => handleQuantityChange(item.product_id, +1)}>+</button>
                    </div>

                    <span className="price">₹{item.total_price}</span>

                    <button className="remove-btn" onClick={() => handleRemoveItem(item.product_id)}>
                      🗑
                    </button>
                  </div>
                </div>
              </div>
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
                <span>{paymentState === "creating-order" ? "Creating secure payment order..." : paymentState === "opening-checkout" ? "Opening Razorpay checkout..." : "Processing Payment..."}</span>
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

      <Footer />
    </div>
  );
};

export default CartPage;