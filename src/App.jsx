import { Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import HomePage from "./Pages/HomePage/HomePage";
import Login from "./Authentication/Login";
import Signup from "./Authentication/Signup";
import Products from "./Pages/ProductPage/Products";
import AboutUsPage from "./Pages/AboutUs/AboutUsPage";
import FavoritePage from "./Pages/FavoritePage/FavoritePage";
import CartPage from "./Pages/CartPage/CartPage";
import ProfilePage from "./Pages/ProfilePage/ProfilePage";
import { OrderControl } from "./Dashboard/OrderControl";
import Dashboard from "./Dashboard/Dashboard";
import ProductCrud from "./Dashboard/ProductCrud";
import ImageCrud from "./Dashboard/ImageCrud";
import CategoryCrud from "./Dashboard/CategoryCrud";
import ScrollToTop from "./Components/ScrollToTop/ScrollToTop";
import CheckOutPage from "./Pages/CheckOutPage/CheckOutPage";
import BagPage from "./Pages/BagPage/BagPage";
import ErrorBoundary from "./Components/ErrorBoundary/ErrorBoundary";
import MessageButton from "./Components/MessageButton/MessageButton";

function App() {
  return (
    <>
      <ScrollToTop />
      <ErrorBoundary>
        <Routes>
          {/* Public Pages */}
          <Route path="/" element={<HomePage />} />
          <Route path="/products" element={<Products />} />
          <Route path="/about-us" element={<AboutUsPage />} />
          <Route path="/favorites" element={<FavoritePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Bag Page */}
          <Route path="/bag_page" element={<BagPage />} />
          {/* Check Out Page */}
          <Route path="/check_out" element={<CheckOutPage />} />

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
      </ErrorBoundary>
    </>
  );
}

export default App;
