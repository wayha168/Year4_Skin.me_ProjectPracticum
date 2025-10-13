import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import axios from "../api/axiosConfig";
// import useAuthContext from "../Authentication/AuthContext";

export const OrderControl = () => {
//   const { user } = useAuthContext(); // get user info from context
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      // ✅ Get token from cookies
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("token="))
        ?.split("=")[1];

      if (!token) return;

      const res = await axios.get("/orders/all", {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });

      setOrders(res.data.data || []);
      console.log("Fetched orders:", res.data.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filter orders by userId or orderStatus
  const filteredOrders = orders.filter(
    (o) =>
      `User ${o.userId}`.toLowerCase().includes(search.toLowerCase()) ||
      o.orderStatus.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">All Orders</h1>

        <div className="bg-white p-6 rounded-2xl shadow mb-6 flex items-center gap-3">
          <input
            type="text"
            placeholder="Search by user ID or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded-lg flex-1"
          />
        </div>

        <div className="bg-white p-6 rounded-2xl shadow">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-2 text-left">Order ID</th>
                <th className="p-2 text-left">Customer</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Total ($)</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length > 0 ? (
                filteredOrders.map((o) => (
                  <tr key={o.orderId} className="border-t hover:bg-gray-50">
                    <td className="p-2">{o.orderId}</td>
                    <td className="p-2">{`User ${o.userId}`}</td>
                    <td
                      className={`p-2 font-medium ${
                        o.orderStatus === "Delivered" ? "text-green-600" : "text-yellow-600"
                      }`}
                    >
                      {o.orderStatus}
                    </td>
                    <td className="p-2">${o.totalAmount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="p-4 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};
