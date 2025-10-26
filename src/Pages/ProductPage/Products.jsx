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
import "./Products.css";

const Products = () => {
  const [notification, setNotification] = useState("");


  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 15;

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { addToCart, addToFavorite, message } = useUserActions();

  const handleImageClick = () => navigate("/check_out");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("/products/all", { withCredentials: true });
        setProducts(res?.data?.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const res = await axios.get("/categories/all-categories");
        setCategories(res?.data?.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };

    fetchProducts();
    fetchCategories();
  }, []);



  // Add to cart
  const handleAddToCart = async (product) => {
  if (!user) {
    setNotification("Please login to add to cart");
    setTimeout(() => {
      setNotification("");
      navigate("/login");
    }, 2000);
    return;
  }

  const success = await addToCart(product.id, 1);
    if (success) {
      setNotification(`Added ${product.name} to cart`);
      setTimeout(() => setNotification(""), 3000);
    }
  };
  // Add to cart


    // Add to Favorite
    const handleFavorite = async (product) => {
    if (!user) {
      setNotification("Please login to add to favorite");
      setTimeout(() => {
        setNotification("");
        navigate("/login");
      }, 2000);
      return;
    }

    const success = await addToFavorite(product.id);
    if (success) {
      setNotification(`Added ${product.name} to favorites`);
      setTimeout(() => setNotification(""), 3000);
    }
  };
      // Add to Favorite



      

  const filteredProducts = Array.isArray(products)
    ? products
        .filter((p) => (selectedCategory ? p?.category?.id === selectedCategory : true))
        .filter((p) => p?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

  return (
    <>
      <Navbar alwaysVisible={true} />
      {notification && <div className="the-notification">{notification}</div>}

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
              {categories.map((cat) => (
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

        {/* Display message from addToCart/addToFavorite */}
        {message && <div className="toast-message">{message}</div>}

        {/* Products Grid */}
        {loading ? (
          <Loading />
        ) : currentProducts.length === 0 ? (
          <p className="loading">No products found.</p>
        ) : (
          <>
            <div className="products-grid">
              {currentProducts.map((p) => (
                <div key={p?.id} className="product-card">
                  <div className="product-img-container">
                    <img
                      src={
                        p?.images?.[0]?.downloadUrl
                          ? `https://backend.skinme.store${p.images[0].downloadUrl}`
                          : ThirdImage
                      }
                      alt={p?.name || "Product Image"}
                      className="product-img"
                      onClick={handleImageClick}
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

            {/* Pagination Controls */}
            <div className="pagination">
              <button onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? "active" : ""}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Products;
