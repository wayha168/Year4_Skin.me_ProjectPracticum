import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "../../api/axiosConfig";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import ThirdImage from "../../assets/third_image.png";
import { FaCartPlus, FaHeart } from "react-icons/fa";
import useAuthContext from "../../Authentication/AuthContext";
import Loading from "../../Components/Loading/Loading";
import useUserActions from "../../Components/Hooks/userUserActions";
import LoginFirst from "../../Components/LoginFirst/LoginFirst.js";
import MessageWidget from "../../Components/MessageWidget/MessageWidget.jsx";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { addToCart, addToFavorite } = useUserActions();
  const loginFirst = new LoginFirst(user, navigate);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get("/categories/all-categories");
        setCategories(res?.data?.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let res;
        if (selectedCategory) {
          res = await axios.get(`/products/by-category/${selectedCategory}`);
        } else {
          res = await axios.get("/products/all");
        }
        setProducts(res?.data?.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = async (productId) => {
    if (!user) {
      loginFirst.redirectToCart();
      return;
    }
    const success = await addToCart(productId, 1);
    if (success) loginFirst.redirectToCart(true);
  };

  const handleFavorite = async (productId) => {
    if (!user) {
      const message = loginFirst.messages.loginRequiredFavorite;
      loginFirst.safeNavigate("/login", {
        state: {
          showLoginPopup: true,
          redirectTo: window.location.pathname,
          popupMessage: message,
        },
      });
      return;
    }
    await addToFavorite(productId);
  };

  const filteredProducts = products.filter((p) => p?.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  return (
    <>
      <Navbar alwaysVisible={true} />
      <main className="products-section h-auto min-h-screen py-10 px-6 bg-gray-50">
        {/* ===== Filter Section ===== */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">🛍️ Our Products</h1>

          <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat?.id} value={cat?.name}>
                  {cat?.name || "Unnamed Category"}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="🔍 Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sort-select"
            />
          </div>
        </div>

        {/* ===== Product Grid ===== */}
        {loading ? (
          <Loading />
        ) : currentProducts.length === 0 ? (
          <p className="text-center text-gray-500 text-lg mt-10">No products found.</p>
        ) : (
          <>
            <div className="products-grid">
              {currentProducts.map((p) => (
                <div
                  key={p?.id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-4 flex flex-col justify-between"
                >
                  <div className="relative">
                    <img
                      src={
                        p?.images?.[0]?.downloadUrl
                          ? `https://backend.skinme.store${p.images[0].downloadUrl}`
                          : ThirdImage
                      }
                      alt={p?.name || "Product Image"}
                      className="rounded-xl w-full h-52 object-cover cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => navigate("/product_details", { state: { product: p } })}
                    />
                    <button
                      className="absolute top-2 right-2 bg-white/80 hover:bg-red-100 text-red-500 p-2 rounded-full shadow-sm transition"
                      onClick={() => handleFavorite(p.id)}
                    >
                      <FaHeart />
                    </button>
                  </div>

                  <div className="mt-4">
                    <h3 className="font-semibold text-gray-800 truncate">{p?.name || "No Name"}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{p?.description || "No description"}</p>
                    <p className="text-lg font-semibold text-blue-600 mt-2">${p?.price ?? "N/A"}</p>
                  </div>

                  <button
                    className="mt-3 flex items-center justify-center gap-2 bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 transition"
                    onClick={() => handleAddToCart(p.id)}
                  >
                    <FaCartPlus /> Add to Cart
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex justify-center items-center gap-2 mt-10">
              {/* Previous Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200"
                    : "text-blue-600 border-blue-300 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                }`}
              >
                ← Prev
              </button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium border transition-all duration-200 ${
                    currentPage === i + 1
                      ? "bg-blue-500 text-white border-blue-500 shadow-sm scale-105"
                      : "text-gray-600 border-gray-200 hover:bg-blue-100 hover:text-blue-600 hover:border-blue-400"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-full border text-sm font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-100 cursor-not-allowed border-gray-200"
                    : "text-blue-600 border-blue-300 hover:bg-blue-500 hover:text-white hover:border-blue-500"
                }`}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
      <MessageWidget />
    </>
  );
};

export default Products;
