// src/Pages/Products/Products.jsx
import React, { useEffect, useState } from "react";
import axios from "../../api/axiosConfig";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import ThirdImage from "../../assets/third_image.png";
import { FaCartPlus, FaHeart } from "react-icons/fa";
import useAuthContext from "../../Authentication/AuthContext";
import "./Products.css";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/products/all", { withCredentials: true }); // <-- axios
        setProducts(res?.data?.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get("/categories/all-categories"); // <-- axios
        setCategories(res?.data?.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setCategories([]);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);

  const handleAddToCart = (product) => {
    if (!user) return alert("Please log in to add to cart");
    if (!product?.name) return alert("Invalid product");
    alert(`Added ${product.name} to cart`);
  };

  const handleFavorite = (product) => {
    if (!user) return alert("Please log in to favorite");
    if (!product?.name) return alert("Invalid product");
    alert(`Added ${product.name} to favorites`);
  };

  // Filter + search
  const filteredProducts = Array.isArray(products)
    ? products
        .filter((p) => (selectedCategory ? p?.category?.id === selectedCategory : true))
        .filter((p) => p?.name?.toLowerCase().includes(searchTerm.toLowerCase() || ""))
    : [];

  return (
    <>
      <Navbar alwaysVisible={true} />

      <main className="products-section h-auto min-h-screen py-8 px-4 bg-gray-100">
        <div className="products-header py-6 px-4 flex flex-col md:flex-row md:justify-between md:items-center">
          <h1 className="product-title">Our Products</h1>

          <div className="sort-dropdown">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="sort-select"
            >
              <option value="">All Categories</option>
              {Array.isArray(categories) &&
                categories.map((cat) => (
                  <option key={cat?.id} value={cat?.id}>
                    {cat?.name || "Unnamed Category"}
                  </option>
                ))}
            </select>

            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="sort-select"
            />
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <p className="loading">Loading products...</p>
        ) : !Array.isArray(filteredProducts) || filteredProducts.length === 0 ? (
          <p className="loading">No products found.</p>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((p) => (
              <div key={p?.id || Math.random()} className="product-card">
                <div className="product-img-container">
                  <img
                    src={
                      p?.images?.[0]?.downloadUrl
                        ? `https://backend.skinme.store${p.images[0].downloadUrl}`
                        : ThirdImage
                    }
                    alt={p?.name || "Product Image"}
                    className="product-img"
                  />
                  <button className="favorite-btn" onClick={() => handleFavorite(p)}>
                    <FaHeart />
                  </button>
                </div>

                <div className="product-info">
                  <h3 className="product-name">{p?.name || "No Name"}</h3>
                  <p className="product-desc">{p?.description || "No description available"}</p>
                  <p className="product-price">${p?.price ?? "N/A"}</p>
                  <button className="add-to-cart" onClick={() => handleAddToCart(p)}>
                    <FaCartPlus />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Products;
