import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import './assets/styles.css';

function App() {
  return (
    <Router>
      <div className="app-shell">
        <AppRoutes />
      </div>
    </Router>
  );
}

export default App;