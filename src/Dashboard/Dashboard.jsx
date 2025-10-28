import React, { useState, useEffect } from "react";
import axios from "../api/axiosConfig";
import Sidebar from "../Components/Sidebar/Sidebar";
import Cookies from "js-cookie";
import { ShoppingCart, TrendingUp, DollarSign, Package } from "lucide-react"; // modern icons
import HeaderWithRole from "../Components/Hooks/HeaderWithRole";

const fetchSalesRecords = async () => {
  const token = Cookies.get("token");
  if (!token) throw new Error("No authentication token found. Please log in.");

  try {
    const response = await axios.get("/popular/sales", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const products = response.data.data || [];
    return { salesRecords: products };
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      throw new Error("Authentication failed. Please log in again.");
    }
    throw new Error(err.response?.data?.message || "Failed to fetch sales records");
  }
};

const Dashboard = () => {
  const [salesRecords, setSalesRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const { salesRecords } = await fetchSalesRecords();
        setSalesRecords(salesRecords);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = salesRecords.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(salesRecords.length / itemsPerPage);

  // Summary data
  const totalSales = salesRecords.reduce((sum, p) => sum + (p.price || 0) * (p.quantitySold || 0), 0);
  const totalQuantity = salesRecords.reduce((sum, p) => sum + (p.quantitySold || 0), 0);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">Dashboard Overview</h1>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">User Management</h1>
          <HeaderWithRole />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
          <div className="bg-white shadow rounded-2xl p-6 flex items-center gap-4">
            <DollarSign className="text-green-500 w-10 h-10" />
            <div>
              <h2 className="text-gray-500 text-sm">Total Revenue</h2>
              <p className="text-xl font-semibold">${totalSales.toFixed(2)}</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-2xl p-6 flex items-center gap-4">
            <Package className="text-blue-500 w-10 h-10" />
            <div>
              <h2 className="text-gray-500 text-sm">Products Sold</h2>
              <p className="text-xl font-semibold">{totalQuantity}</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-2xl p-6 flex items-center gap-4">
            <TrendingUp className="text-orange-500 w-10 h-10" />
            <div>
              <h2 className="text-gray-500 text-sm">Total Products</h2>
              <p className="text-xl font-semibold">{salesRecords.length}</p>
            </div>
          </div>

          <div className="bg-white shadow rounded-2xl p-6 flex items-center gap-4">
            <ShoppingCart className="text-purple-500 w-10 h-10" />
            <div>
              <h2 className="text-gray-500 text-sm">Pending Orders</h2>
              <p className="text-xl font-semibold">12</p>
            </div>
          </div>
        </div>

        {/* Sales Table */}
        <section className="bg-white shadow rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Sales Record</h2>

          {loading && <p className="text-gray-600">Loading sales data...</p>}
          {error && <p className="text-red-600">Error: {error}</p>}

          {!loading && !error && salesRecords.length === 0 && (
            <p className="text-gray-600">No sales records found.</p>
          )}

          {!loading && !error && salesRecords.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="min-w-full text-sm text-gray-700">
                <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3 text-left">Product ID</th>
                    <th className="px-6 py-3 text-left">Name</th>
                    <th className="px-6 py-3 text-left">Price</th>
                    <th className="px-6 py-3 text-left">Quantity Sold</th>
                    <th className="px-6 py-3 text-left">Total</th>
                    <th className="px-6 py-3 text-left">Total Sale</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product) => (
                    <tr key={product.productId} className="hover:bg-gray-50 border-t">
                      <td className="px-6 py-4">{product.productId}</td>
                      <td className="px-6 py-4 font-medium">{product.name}</td>
                      <td className="px-6 py-4">${product.price?.toFixed(2) || "N/A"}</td>
                      <td className="px-6 py-4">{product.quantitySold || 0}</td>
                      <td className="px-6 py-4 font-semibold">
                        ${(product.price * product.quantitySold || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 font-semibold text-green-600">
                        $
                        {product.price && product.quantitySold
                          ? (product.price * product.quantitySold).toFixed(2)
                          : "0.00"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6 gap-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
                    currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
