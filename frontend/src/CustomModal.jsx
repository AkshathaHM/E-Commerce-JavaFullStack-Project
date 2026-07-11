// CustomModal.jsx
import React, { useEffect, useState } from "react";
import "./assets/modalStyles.css";

const CustomModal = ({ modalType, onClose, onSubmit, response }) => {
  // ... (your existing modal code remains the same until ModifyUserFormComponent)

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {/* ... your other modal forms ... */}

        {/* ModifyUser */}
        {modalType === "modifyUser" && (
          <ModifyUserFormComponent onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default CustomModal;

// Fixed ModifyUserFormComponent
const ModifyUserFormComponent = ({ onClose }) => {
  const [userId, setUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [updated, setUpdated] = useState(false);

  const handleFetchUser = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const userid = formData.get("user-id");

      if (!userid) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/getbyid`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userid }),
      });

      if (response.ok) {
        const user = await response.json();
        setUserDetails(user);
        setUserId(userid);
      }
    } catch (error) {
      console.log("Error fetching user details", error);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username");
    const email = formData.get("email");
    const role = formData.get("role");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/user/modify`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: +userId,
        username,
        email,
        role,
      }),
    });

    if (response.ok) {
      const user = await response.json();
      setUpdated(true);
      setUserDetails(user);
    }
  };

  // ... rest of your component (keep the return JSX same)
  if (!userDetails) {
    return (
      <form onSubmit={handleFetchUser}>
        <div className="modal-form-item">
          <label htmlFor="user-id">User ID:</label>
          <input
            type="text"
            id="user-id"
            name="user-id"
            value={userId || ""}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        <button type="submit">Get User</button>
      </form>
    );
  }

  if (userDetails && !updated) {
    return (
      <div>
        <form onSubmit={handleUpdateUser} className="modal-form">
          <div className="modal-form-item">
            <label htmlFor="user-id">User ID:</label>
            <input type="text" id="user-id" name="user-id" value={userId} readOnly />
          </div>
          <div className="modal-form-item">
            <label htmlFor="username">Username:</label>
            <input type="text" id="username" name="username" defaultValue={userDetails?.username} />
          </div>
          <div className="modal-form-item">
            <label htmlFor="email">Email:</label>
            <input type="email" id="email" name="email" defaultValue={userDetails?.email} />
          </div>
          <div className="modal-form-item">
            <label htmlFor="role">Role:</label>
            <input type="text" id="role" name="role" defaultValue={userDetails.role} />
          </div>
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }

  if (updated) {
    return (
      <div>
        <h2>Updated User Details</h2>
        <div className="user-details">
          <p><strong>User ID:</strong> {userDetails.userId}</p>
          <p><strong>Username:</strong> {userDetails.username}</p>
          <p><strong>Email:</strong> {userDetails.email}</p>
          <p><strong>Role:</strong> {userDetails.role}</p>
        </div>
        <button onClick={onClose}>Close</button>
      </div>
    );
  }
  return <></>;
};