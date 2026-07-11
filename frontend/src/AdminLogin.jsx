import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./assets/styles.css";
import { Toast } from "./Toast";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowToast(true);
        setTimeout(() => {
          if (data.role === "ADMIN") {
            navigate("/admindashboard", { state: { username: data.username || username } });
          } else {
            navigate("/customerhome");
          }
        }, 1500);
      } else {
        throw new Error(data.error || "Login failed");
      }
    } catch (err) {
      setError(err.message || "Unexpected error");
    }
  };

  return (
    <div className="page-layout">
      <Toast message="Login Successful!" show={showToast} />
      <div className="page-container1">
        <div className="form-container">
          <h1 className="form-title">Admin Login</h1>
          {error && <p className="error-message">{error}</p>}
          <form onSubmit={handleSignIn} className="form-content">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-input-wrap">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <span onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>
            </div>
            <button type="submit">Enter As Admin</button>
          </form>
          <div className="form-footer">
            <Link to="/forgot-password" state={{ returnTo: "/admin" }}>Forgot Password?</Link>
            <Link to="/">Not Admin? Login as User</Link>
          </div>
        </div>
      </div>
    </div>
  );
}