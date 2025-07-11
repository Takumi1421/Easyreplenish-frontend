import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './App.css'; // Optional, for styling

function App() {
  const [inventory, setInventory] = useState([]);
  const [newSKU, setNewSKU] = useState({
    sku_id: '',
    product_name: '',
    current_stock: 0,
    reorder_threshold: 0,
  });

  const fetchInventory = () => {
    axios.get('https://easyreplenish-backend.onrender.com/inventory')
      .then(res => setInventory(res.data))
      .catch(err => console.error('Error fetching inventory:', err));
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const addSKU = () => {
    axios.post('https://easyreplenish-backend.onrender.com/sku', newSKU)
  .then(() => {
    setNewSKU({ sku_id: '', product_name: '', current_stock: 0, reorder_threshold: 0 });
    fetchInventory(); // Refresh list
  })
  .catch(err => console.error("Error adding SKU:", err));
  };

  return (
    <div className="container" style={{ padding: '2rem', fontFamily: 'Arial' }}>
      <h1>📦 EasyReplenish Dashboard</h1>

      <div style={{ margin: '2rem 0', padding: '1rem', backgroundColor: '#f3f3f3', borderRadius: '8px' }}>
        <h3>Add New SKU</h3>
        <input placeholder="SKU ID" value={newSKU.sku_id}
          onChange={e => setNewSKU({ ...newSKU, sku_id: e.target.value })} />
        <input placeholder="Product Name" value={newSKU.product_name}
          onChange={e => setNewSKU({ ...newSKU, product_name: e.target.value })} />
        <input type="number" placeholder="Stock" value={newSKU.current_stock}
          onChange={e => setNewSKU({ ...newSKU, current_stock: parseInt(e.target.value) })} />
        <input type="number" placeholder="Reorder Threshold" value={newSKU.reorder_threshold}
          onChange={e => setNewSKU({ ...newSKU, reorder_threshold: parseInt(e.target.value) })} />
        <button onClick={addSKU}>➕ Add SKU</button>
      </div>

      <table border="1" cellPadding="10" width="100%">
        <thead>
          <tr>
            <th>SKU ID</th>
            <th>Product Name</th>
            <th>Stock</th>
            <th>Reorder Threshold</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {inventory.map(item => (
            <tr key={item.sku_id} style={{
              backgroundColor: item.current_stock < item.reorder_threshold ? '#ffe0e0' : ''
            }}>
              <td>{item.sku_id}</td>
              <td>{item.product_name}</td>
              <td>{item.current_stock}</td>
              <td>{item.reorder_threshold}</td>
              <td>{item.current_stock < item.reorder_threshold ? '⚠️ Reorder' : '✅ OK'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;