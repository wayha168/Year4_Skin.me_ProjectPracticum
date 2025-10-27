// FavoritePage.jsx
import React, { useEffect, useState } from "react";
import MessageButton from "../../Components/MessageButton/MessageButton";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosConfig";
import "./FavoritePage.css";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import useAuthContext from "../../Authentication/AuthContext";
import ThirdImage from "../../assets/third_image.png";

const FavoritePage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState("");

  const { user } = useAuthContext();
  const navigate = useNavigate();
  const userId = user?.id;

  // Fetch favorites
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`/favorites/user/${userId}`, { withCredentials: true });
        setFavorites(res?.data?.data || []);
        console.log("Fetched favorites:", res?.data?.data || []);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [userId]);

  // Remove favorite
  const handleRemoveFavorite = async (productId) => {
    if (!userId) return alert("Please log in to remove favorite");

    try {
      await axios.delete(`/favorites/remove`, {
        params: { userId, productId },
        withCredentials: true,
      });
      setFavorites((prev) => prev.filter((fav) => fav.product.id !== productId));
      setNotification("Removed from favorites");
      setTimeout(() => setNotification(""), 2000);
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert("Failed to remove favorite");
    }
  };

  const handleProductClick = (product) => {
    navigate("/check_out", { state: { product } });
  }

  const getProductImage = (product) => {
    const imageUrl = product?.images?.[0]?.downloadUrl;
    return imageUrl ? `https://backend.skinme.store${imageUrl}` : ThirdImage;
  };

  useEffect(() => {
  if (!userId) {
    navigate("/login", { state: { redirectTo: "/favorites", showLoginPopup: true } });
  }
}, [userId, navigate]);

  return (
    <>
      <Navbar />
      {notification && <div className="remove_bag_alert">{notification}</div>}

      <section className="products-section h-auto min-h-screen py-8 px-4 bg-gray-100">
        <div className="products-favorite">
          <h1 className="favorite-title">My Favorites</h1>
        </div>

        {loading ? (
          <p className="loading">Loading your favorites...</p>
        ) : favorites.length === 0 ? (
          <p className="loading">You have no favorite products.</p>
        ) : (
          <div className="products-grid">
            {favorites.map((fav) => {
              const product = fav.product;
              return (
                <div className="product-card" key={product?.id}>
                  <div className="product-img-container" onClick={() => handleProductClick(product?.id)}>
                    <img src={getProductImage(product)} alt={product?.name} className="product-img" />
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product?.name}</h3>
                    <p className="product-brand">{product?.brand}</p>
                    <p className="product-description">
                      {product?.description || "No description available."}
                    </p>
                    <p className="product-price">${product?.price?.toFixed(2)}</p>


                    <div className="add_to_card_and_remove">
                      <p className="remove_favorite" onClick={() => handleRemoveFavorite(product?.id)}>
                        <i class="fa-solid fa-trash"/>
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
        
      <Footer />
      <MessageButton/>
    </>
  );
};

export default FavoritePage;
