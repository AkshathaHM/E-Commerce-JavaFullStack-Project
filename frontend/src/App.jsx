import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import default styles
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<LoginForm />} />
          <Route path="/register" element={<RegisterForm />} />
          <Route path="/customerhome" element={<div className="dashboard">Customer Dashboard</div>} />
          <Route path="/adminhome" element={<div className="dashboard">Admin Dashboard</div>} />
          <Route path="/" element={<LoginForm />} />
        </Routes>
        <ToastContainer
          position="top-right" // Top-right like modern apps
          autoClose={3000} // Auto-dismiss after 3s
          hideProgressBar={false} // Show progress bar
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light" // Light theme
          // Custom styles (green success, red error)
          style={{ fontSize: '1rem' }} // Larger font
        />
      </div>
    </Router>
  );
}

export default App;