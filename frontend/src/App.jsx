import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
import AppRoutes from './Routes';
import './assets/styles.css';
import { ThemeProvider } from './ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ThemeProvider>
  );
}

export default App;