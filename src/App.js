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

  useEffect(() => {
    axios
      .get("https://easyreplenish-backend.onrender.com/inventory")
      .then((res) => {
        setInventory(res.data);
        res.data.forEach((sku) => {
          fetchSales(sku.sku_id);
          fetchProfit(sku.sku_id);
        });
      })
      .catch((err) => console.error("Inventory fetch error:", err));
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
    const data = salesData[skuId] || [];
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
        {inventory.map((sku) => (
          <div
            key={sku.sku_id}
            className="border border-gray-200 rounded-2xl shadow-xl p-6 bg-white hover:shadow-2xl transition duration-300"
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
              <strong>Profit:</strong> ₹{profits[sku.sku_id] || "-"}
            </p>
            <div className="bg-gray-50 p-2 rounded-xl">
              <Line data={getChartData(sku.sku_id)} options={{ responsive: true }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default InventoryDashboard;