import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import './assets/styles.css';

function App() {
  return (
    <Router 
      future={{ 
        v7_startTransition: true,
        v7_relativeSplatPath: true   // ← Add this line
      }}
    >
      <AppRoutes />
    </Router>
  );
}

export default App;