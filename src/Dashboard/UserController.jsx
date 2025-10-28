import React, { useEffect, useState } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import axios from "../api/axiosConfig";
import Cookies from "js-cookie";
import { FaUserCheck, FaUserTimes, FaSearch, FaSync } from "react-icons/fa";
import HeaderWithRole from "../Components/Hooks/HeaderWithRole";

export const UserControl = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const token = Cookies.get("token");
      if (!token) {
        setError("Please log in.");
        return;
      }

      const res = await axios.get("/users/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedUsers = res.data.data || [];
      console.log("Fetched users:", fetchedUsers);
      setUsers(fetchedUsers);
    } catch (err) {
      console.error("Error fetching users:", err);
      if (err.response?.status === 403) {
        setError("Access denied. Admin only.");
      } else if (err.response?.status === 401) {
        setError("Session expired. Please log in.");
      } else {
        setError(err.response?.data?.message || "Failed to load users.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.email?.toLowerCase().includes(term) ||
      u.firstName?.toLowerCase().includes(term) ||
      u.lastName?.toLowerCase().includes(term) ||
      u.role?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleString();
  };

  // Helper: Get role display name and color
  const getRoleInfo = (role) => {
    if (!role) return { name: "Unknown", bg: "bg-gray-100", text: "text-gray-600" };

    const cleanRole = role.replace("ROLE_", "").toUpperCase();

    switch (cleanRole) {
      case "ADMIN":
        return { name: "ADMIN", bg: "bg-purple-100", text: "text-purple-800" };
      case "USER":
        return { name: "USER", bg: "bg-blue-100", text: "text-blue-800" };
      case "MODERATOR":
        return { name: "MOD", bg: "bg-yellow-100", text: "text-yellow-800" };
      case "GUEST":
        return { name: "GUEST", bg: "bg-gray-100", text: "text-gray-700" };
      default:
        return { name: cleanRole, bg: "bg-indigo-100", text: "text-indigo-800" };
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        {/* Fixed: One header with title + role + refresh */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-800">User Management</h1>
          <div className="flex items-center gap-4">
            <HeaderWithRole />
            <button
              onClick={fetchUsers}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <FaSync /> Refresh
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl shadow mb-6 flex items-center gap-3">
          <FaSearch className="text-gray-500" />
          <input
            type="text"
            placeholder="Search by email, name, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-2 outline-none"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading && <div className="p-8 text-center text-gray-600">Loading users...</div>}

          {error && <div className="p-8 text-center text-red-600 font-medium">{error}</div>}

          {!loading && !error && filteredUsers.length === 0 && (
            <div className="p-8 text-center text-gray-500">No users found.</div>
          )}

          {!loading && !error && filteredUsers.length > 0 && (
            <table className="min-w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left">ID</th>
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Role</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Last Login</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {filteredUsers.map((u) => {
                  const { name, bg, text } = getRoleInfo(u.role);

                  return (
                    <tr key={u.id} className="border-t hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono">{u.id}</td>
                      <td className="px-6 py-4">
                        {u.firstName || "—"} {u.lastName || ""}
                      </td>
                      <td className="px-6 py-4">{u.email || "—"}</td>

                      {/* Dynamic Role Badge */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${bg} ${text}`}
                        >
                          {name}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {u.enabled ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <FaUserCheck /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <FaUserTimes /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">{formatDate(u.lastLogin)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
};
