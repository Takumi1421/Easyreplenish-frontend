import React from 'react';
import ReactDOM from 'react-dom/client';
import InventoryDashboard from './App'; // or './InventoryDashboard'

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <InventoryDashboard />
  </React.StrictMode>
);