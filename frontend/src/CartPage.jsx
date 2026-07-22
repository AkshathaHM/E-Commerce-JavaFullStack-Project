import React, { useEffect, useState } from "react";
import "./CartPage.css";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { Toast } from "./Toast";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("authToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        return resolve(window.Razorpay);
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout script'));
      document.body.appendChild(script);
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

  // Checkout
  const handleCheckout = async () => {
    if (checkoutLoading) return;
    if (Number(subtotal) <= 0) {
      alert("Your cart is empty or total is zero.");
      return;
    }

    setCheckoutLoading(true);

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
        const message = `Order creation failed: ${errText || "Server error"}`;
        setPaymentError(message);
          alert(message);
        return;
      }

      const data = await res.json();
      const orderId = data.orderId;
      const amountPaise = data.amountPaise;

      if (!orderId?.startsWith("order_") || !amountPaise || amountPaise < 100) {
        throw new Error("Invalid order data received from server");
      }

      const options = {
        key: "rzp_test_TAsqtBKY9SkyQb",
        amount: amountPaise,
        currency: "INR",
        name: "SalesSavvy",
        description: "Cart Payment",
        order_id: orderId.trim(),
        handler: async (rzpRes) => {
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/verify`, {
              method: "POST",
              credentials: "include",
              headers: { "Content-Type": "application/json", ...getAuthHeaders() },
              body: JSON.stringify({
                razorpay_order_id: rzpRes.razorpay_order_id,
                razorpay_payment_id: rzpRes.razorpay_payment_id,
                razorpay_signature: rzpRes.razorpay_signature,
              }),
            });

            if (verifyRes.ok) {
              const verifyMessage = await verifyRes.text();
              setShowPaymentToast(true);
              setPaymentSuccessData({
                orderId: rzpRes.razorpay_order_id,
                paymentId: rzpRes.razorpay_payment_id,
                amount: Number(subtotal).toFixed(2),
                message: verifyMessage || "Payment verified successfully",
              });
              setPaymentError(null);
              setCartItems([]);
              setSubtotal("0.00");
              setTimeout(() => navigate("/customerhome"), 4000);
            } else {
              const verifyMessage = await verifyRes.text();
              const message = `Payment verification failed: ${verifyMessage}`;
              setPaymentError(message);
              alert(message);
            }
          } catch (e) {
            console.error("Payment verification error:", e);
            const message = "Payment processed but verification failed.";
            setPaymentError(message);
            alert(message);
          }
        },
        prefill: {
          name: username || "Customer",
          email: "customer@example.com",
          contact: "9999999999",
        },
        modal: {
          ondismiss: () => {
            // Do not show a cancellation message when the Razorpay modal is closed.
          },
        },
        theme: { color: "#00ABE4" },
      };

      const Razorpay = await loadRazorpayScript();
      const rzp = new Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Checkout process failed:", err);
      alert(err.message || "Something went wrong during checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const totalItems = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const shipping = "370.00";

  if (paymentSuccessData) {
    return (
      <div className="cart-page success-page">
        <Header cartCount={0} username={username || 'Guest'} />
        <div className="payment-success-screen">
          <div className="success-card">
            <h1>Payment Successful</h1>
            <p>Your payment was completed successfully.</p>
            <div className="success-details">
              <p><strong>Order ID:</strong> {paymentSuccessData.orderId}</p>
              <p><strong>Payment ID:</strong> {paymentSuccessData.paymentId}</p>
              <p><strong>Amount:</strong> ₹{paymentSuccessData.amount}</p>
            </div>
            <p>{paymentSuccessData.message}</p>
            <p>You will be redirected shortly...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-page">
        <Header cartCount="..." username={username || 'Guest'} />
        <div style={{ textAlign: "center", padding: "60px 20px", minHeight: "60vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "inline-block", width: "50px", height: "50px", border: "4px solid #00ABE4", borderTop: "4px solid #transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></div>
          </div>
          <h2 style={{ color: "#333", marginBottom: "10px" }}>Loading your cart...</h2>
          <p style={{ color: "#666" }}>Please wait while we fetch your cart items.</p>
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
      <Toast message="Payment Successful!" show={showPaymentToast} />
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
                  src={item.image_url?.startsWith("http") ? item.image_url : "https://via.placeholder.com/80?text=No+Image"}
                  alt={item.name || "Product"}
                  onError={(e) => (e.target.src = "https://via.placeholder.com/80?text=?")}
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
              {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;