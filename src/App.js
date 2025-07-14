import React, { useEffect, useState } from "react";
import axios from "axios";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [salesData, setSalesData] = useState({});
  const [profits, setProfits] = useState({});
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios
      .get("https://easyreplenish-backend.onrender.com/inventory")
      .then((res) => {
        console.log("Fetched inventory:", res.data);
        if (Array.isArray(res.data)) {
          setInventory(res.data);
          res.data.forEach((sku) => {
            if (sku && sku.sku_id) {
              fetchSales(sku.sku_id);
              fetchProfit(sku.sku_id);
            }
          });
        } else {
          console.error("Expected array, got:", res.data);
        }
      })
      .catch((err) => console.error("Inventory fetch error:", err));

    axios
      .get("https://easyreplenish-backend.onrender.com/orders")
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => console.error("Order fetch error:", err));
  }, []);

  const fetchSales = (skuId) => {
    axios
      .get(`https://easyreplenish-backend.onrender.com/sales/${skuId}`)
      .then((res) => {
        setSalesData((prev) => ({ ...prev, [skuId]: res.data }));
      })
      .catch((err) => console.error("Sales fetch error:", err));
  };

  const fetchProfit = (skuId) => {
    axios
      .get(`https://easyreplenish-backend.onrender.com/profit/${skuId}`)
      .then((res) => {
        setProfits((prev) => ({ ...prev, [skuId]: res.data.profit }));
      })
      .catch((err) => console.error("Profit fetch error:", err));
  };

  const getChartData = (skuId) => {
    const data = Array.isArray(salesData[skuId]) ? salesData[skuId] : [];
    if (!salesData[skuId]) {
      console.warn(`No sales data for SKU: ${skuId}`);
    }
    return {
      labels: data.map((s) => new Date(s.date).toLocaleDateString()),
      datasets: [
        {
          label: "Units Sold",
          data: data.map((s) => s.quantity),
          fill: true,
          borderColor: "#4F46E5",
          backgroundColor: "rgba(99, 102, 241, 0.1)",
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "#4F46E5"
        }
      ]
    };
  };

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-10">
        📦 EasyReplenish Dashboard
      </h1>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {inventory.length > 0 ? (
          inventory.map((sku) => {
            console.log("Rendering SKU card for:", sku);
            return (
              <div
                key={sku.sku_id}
                className="bg-white border-2 border-indigo-100 shadow-xl rounded-2xl p-6 transition-all hover:shadow-2xl hover:scale-[1.02]"
              >          
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xl font-semibold text-indigo-600">
                    {sku.product_name}
                  </h2>
                  <span className="text-sm text-gray-400">SKU: {sku.sku_id}</span>
                </div>
                <p className="text-gray-700">
                  <strong>Stock:</strong> {sku.current_stock}
                </p>
                <p className="text-gray-700">
                  <strong>Reorder Threshold:</strong> {sku.reorder_threshold}
                </p>
                <p className="text-gray-700 mb-4">
                  <strong>Profit:</strong> ₹{profits?.[sku?.sku_id] || 0}
                </p>
                <div className="bg-gray-50 p-2 rounded-xl text-sm text-gray-400">
                  <p>Chart rendering temporarily disabled for debugging.</p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No inventory available. Please add some SKUs.
          </p>
        )}
      </div>
      <h2 className="text-2xl font-bold text-gray-700 mt-12 mb-4">📦 Live Orders</h2>
      <div className="overflow-auto rounded-lg shadow-lg border border-gray-200 bg-white">
        <table className="min-w-full table-auto">
          <thead className="bg-indigo-100 text-indigo-800 text-sm font-semibold text-left">
            <tr>
              <th className="py-3 px-4">Order ID</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Platform</th>
              <th className="py-3 px-4">Quantity</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-2 px-4">{order.order_id}</td>
                <td className="py-2 px-4">{order.sku_id}</td>
                <td className="py-2 px-4">{order.platform}</td>
                <td className="py-2 px-4">{order.quantity}</td>
                <td className={`py-2 px-4 font-semibold ${
                  order.status.toLowerCase() === 'delivered' ? 'text-green-600' :
                  order.status.toLowerCase() === 'shipped' ? 'text-yellow-600' :
                  order.status.toLowerCase() === 'returned' ? 'text-red-500' : 'text-gray-600'
                }`}>
                  {order.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryDashboard;