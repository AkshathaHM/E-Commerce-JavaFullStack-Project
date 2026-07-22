import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook
import useravatar from './useravatar.png';
import './assets/styles.css';

export function ProfileDropdown({ username }) {
  const [isOpen, setIsOpen] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const navigate = useNavigate(); // Initialize useNavigate hook

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setProfileData(null);
      setProfileError(null);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });

      if (response.ok) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('username');
        console.log('User successfully logged out');
        navigate('/'); // Redirect to login page
      } else {
        console.error('Failed to log out');
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handleViewProfile = async () => {
    setIsLoadingProfile(true);
    setProfileError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfileData(data);
      } else {
        setProfileError('Failed to fetch profile');
        console.error('Failed to fetch profile');
      }
    } catch (e) {
      setProfileError('Error fetching profile');
      console.error('Error fetching profile', e);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleOrdersClick = () => {
    navigate('/orders');
    setIsOpen(false);
  };

  const handleCartClick = () => {
    navigate('/UserCartPage');
    setIsOpen(false);
  };

  return (
    <div className={`profile-dropdown ${isOpen ? 'open' : ''}`}>
      <button className="profile-button" onClick={toggleDropdown}>
        <img
          src={useravatar}
          alt="User Avatar"
          className="user-avatar"
          onError={(e) => { e.target.src = 'fallback-logo.png'; }}
        />
        <span className="username">{username || 'Guest'}</span>
      </button>
      <div className={`dropdown-menu ${isOpen ? 'visible' : ''}`}>
        <div className="dropdown-top">
          <button className="dropdown-link" type="button" onClick={handleCartClick}>Cart</button>
          <button className="dropdown-link" type="button" onClick={handleOrdersClick}>Orders</button>
        </div>

        <button className="dropdown-link" type="button" onClick={handleViewProfile} disabled={isLoadingProfile}>
          {isLoadingProfile ? 'Loading profile...' : 'View Profile'}
        </button>

        {profileError && <div className="dropdown-error">{profileError}</div>}

        {profileData && (
          <div className="profile-card card-centered">
            <h4>Profile Details</h4>
            <p><strong>Username:</strong> {profileData.username || username || 'N/A'}</p>
            <p><strong>Name:</strong> {profileData.name || 'N/A'}</p>
            <p><strong>Email:</strong> {profileData.email || 'N/A'}</p>
            <p><strong>Role:</strong> {profileData.role || 'N/A'}</p>
            <p><strong>Verified:</strong> {profileData.verified ? 'Yes' : 'No'}</p>
            <p><strong>Enabled:</strong> {profileData.enabled ? 'Yes' : 'No'}</p>
            <p><strong>Address:</strong> {profileData.address || 'Not provided'}</p>
            {profileData.createdAt && <p><strong>Joined:</strong> {new Date(profileData.createdAt).toLocaleDateString()}</p>}
          </div>
        )}

        <button className="profile-button logout-button" type="button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}
