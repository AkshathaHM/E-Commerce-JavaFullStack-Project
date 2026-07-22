import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useravatar from './useravatar.png';

export function ProfileDropdown({ username }) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="profile-dropdown">
      <button className="profile-button" onClick={() => setIsOpen(!isOpen)}>
        <img src={useravatar} alt="User" className="user-avatar" />
        <span className="username">{username || 'Guest'}</span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          <button onClick={() => navigate('/orders')}>My Orders</button>
          <button onClick={() => navigate('/UserCartPage')}>Cart</button>
          <button onClick={() => navigate('/profile')}>View Profile</button>
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}