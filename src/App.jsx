// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage";
import Login from "./Authentication/Login";
import Signup from "./Authentication/Signup";
import Dashboard from "./Dashboard/Dashboard";
import ProductCrud from "./Dashboard/ProductCrud";
import { OrderControl } from "./Dashboard/OrderControl";
import "./index.css";
import ImageCrud from "./Dashboard/ImageCrud";
import CategoryCrud from "./Dashboard/CategoryCrud";
import Products from "./products/Products"; 

function App() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<Products />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />

      {/* Dashboard Pages */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/product-crud" element={<ProductCrud />} />
      <Route path="/order-control" element={<OrderControl />} />
      <Route path="/image-crud" element={<ImageCrud />} />
      <Route path="/category-crud" element={<CategoryCrud />} />

      {/* Redirects */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* 404 Fallback */}
      <Route
        path="*"
        element={<div className="text-center mt-20 text-2xl font-semibold">404 - Page Not Found</div>}
      />
    </Routes>
  );
}

export default App;
