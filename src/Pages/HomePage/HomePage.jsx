import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar.jsx";
import Footer from "../../Components/Footer/Footer.jsx";
import axios from "../../api/axiosConfig";
import useUserActions from "../../Components/Hooks/userUserActions.js";
import useAuthContext from "../../Authentication/AuthContext.jsx";
import "./HomePage.css";
import MainImage from "../../assets/product_homepage.png";
import FirstImage from "../../assets/first_image.png";
import SecondImage from "../../assets/second_image.png";
import ThirdImage from "../../assets/third_image.png";
import { FaCartPlus, FaHeart } from "react-icons/fa";

const HomePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthContext();

  const { addToCart, addToFavorite, message } = useUserActions();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollToProducts = () => {
    const section = document.getElementById("product");
    if (section) {
      const navbarHeight = document.querySelector(".navbar-wrapper")?.offsetHeight || 0;
      const y = section.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (location.state?.scrollTo === "product") {
      scrollToProducts();
    }
  }, [location]);

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
    fetchProducts();
  }, []);

  const handleFavoriteClick = async (productId) => {
    if (!user) return alert("Please log in to add favorite");
    const success = await addToFavorite(productId);
    if (success) setTimeout(() => {}, 2000);
  };

  const handleAddToCartClick = async (productId) => {
    if (!user) return alert("Please log in to add to cart");
    const success = await addToCart(productId, 1);
    if (success) setTimeout(() => {}, 2000);
  };

  const goToProducts = (e) => {
    e.preventDefault();
    scrollToProducts();
  };

  return (
    <>
      <Navbar alwaysVisible={true} />
      {message && <div className="toast-message">{message}</div>}

      {/* ===== HERO SECTION ===== */}
      <div className="homepage_main_wrapper">
        <div className="round_purple fourth"></div>
        <div className="homepage-container">
          <div className="round_purple first"></div>
          <div className="homepage_content_position">
            <div className="homepage-content">
              <p className="homepage-title">Welcome to SKIN.ME</p>
            </div>
            <div className="homepage-content">
              <p className="most_essential">Most Essential Skin Care Product</p>
            </div>
            <div className="homepage-content">
              <p className="give_you_the">Give you the best skincare products is our mission.</p>
            </div>
            <div className="homepage-content">
              <button onClick={goToProducts} className="shop_now">
                Shop Now
              </button>
            </div>
          </div>
        </div>
        <div className="main_image">
          <img src={MainImage} alt="skin product" className="main_image_homepage" />
        </div>
        <div className="round_purple second"></div>
      </div>
      <div className="main_overview_wrapper">
        {" "}
        <div className="mini_overview_wrapper">
          {" "}
          <div className="let_have_a">Let's Have A Look</div>{" "}
          <div className="this_is_the_overview">
            {" "}
            This is the overview about our products that you can spent few minutes to see how it look.{" "}
          </div>{" "}
          <div className="the_two_images">
            {" "}
            <img className="first_image" src={FirstImage} />{" "}
            <img className="second_image" src={SecondImage} />{" "}
          </div>{" "}
        </div>{" "}
        <div className="big_single_image">
          {" "}
          <img className="third_image" src={ThirdImage} />{" "}
        </div>{" "}
        <div className="round_purple third"></div>{" "}
      </div>

      {/* ===== PRODUCTS SECTION ===== */}
      <section id="product" className="home-products-section">
        <div className="section-header">
          <h2>Our Products</h2>
          <button className="view-all-btn" onClick={() => navigate("/products")}>
            View All
          </button>
        </div>

        {loading ? (
          <p className="loading">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="loading">No products found.</p>
        ) : (
          <div className="products-grid">
            {products.slice(0, 10).map((p) => (
              <div key={p.id} className="product-card">
                <div className="product-img-container">
                  <img
                    src={
                      p?.images?.[0]?.downloadUrl
                        ? `https://backend.skinme.store${p.images[0].downloadUrl}`
                        : ThirdImage
                    }
                    alt={p.name}
                    className="product-img"
                  />
                  <button className="favorite-btn" onClick={() => handleFavoriteClick(p.id)}>
                    <FaHeart />
                  </button>
                </div>
                <div className="product-info">
                  <h3 className="product-name">{p.name}</h3>
                  <p className="product-price">${p.price}</p>
                  <button className="add-to-cart" onClick={() => handleAddToCartClick(p.id)}>
                    <FaCartPlus /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ===== ABOUT US SECTION ===== */}
      <div id="aboutus" className="main_wrapper_about_us">
        <div className="mini_sentence_wrapper">
          <p className="word_about_us">About Us</p>
          <p className="sentent_skin_me_is">
            SKIN.ME is more than skincare — it’s a daily ritual of self-respect and renewal. We craft
            minimalist, effective formulas designed for real skin and real lives.
          </p>
        </div>
        <div className="about_us_image_wrapper">
          <img className="about_us_image" src={FirstImage} />
          <img className="about_us_image" src={SecondImage} />
          <img className="about_us_image" src={ThirdImage} />
          <img className="about_us_image" src={FirstImage} />
        </div>
      </div>

      <Footer />
    </>
  );
};

export default HomePage;
