import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaChartLine,
  FaBoxOpen,
  FaClipboardList,
  FaSignOutAlt,
  FaImages,
  FaTags,
  FaDollarSign,
} from "react-icons/fa";

const Sidebar = () => {
  const { pathname } = useLocation();

  const linkClass = (path) =>
    `flex items-center gap-3 p-2 rounded-lg transition-all ${
      pathname === path ? "bg-blue-200 text-blue-700 font-semibold" : "hover:bg-blue-100 text-gray-700"
    }`;

  return (
    <aside className="w-64 bg-white shadow-lg p-5 flex flex-col min-h-screen">
      {/* Logo / Title */}
      <h2 className="text-2xl font-bold text-blue-600 mb-8 tracking-wide">Skin.Me Admin</h2>

      {/* Navigation */}
      <nav className="flex flex-col gap-2">
        <Link to="/dashboard" className={linkClass("/dashboard")}>
          <FaChartLine /> Dashboard
        </Link>

        <Link to="/category-crud" className={linkClass("/category-crud")}>
          <FaTags /> Categories
        </Link>
        
        <Link to="/product-crud" className={linkClass("/product-crud")}>
          <FaBoxOpen /> Product CRUD
        </Link>

        <Link to="/image-crud" className={linkClass("/image-crud")}>
          <FaImages /> Image Manager
        </Link>


        <Link to="/order-control" className={linkClass("/order-control")}>
          <FaClipboardList /> Order History
        </Link>

        {/* <Link to="/sales-report" className={linkClass("/sales-report")}>
          <FaDollarSign /> Sales
        </Link> */}
      </nav>

      {/* Logout */}
      <div className="mt-auto border-t border-gray-200 pt-4">
        <button className="flex items-center gap-3 p-2 text-red-500 hover:bg-red-100 rounded-lg w-full transition">
          <FaSignOutAlt /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
