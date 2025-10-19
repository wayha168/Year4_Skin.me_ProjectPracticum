import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axiosConfig";
import "./FavoritePage.css";
import ThirdImage from "../../assets/third_image.png";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

export const FavoritePage = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bagAdded, setBagAdded] = useState(false);
  const [favoriteRemoved, setFavoriteRemoved] = useState(false);
  const navigate = useNavigate();

  // ✅ Replace this with real logged-in user ID (from context, cookie, etc.)
  const userId = localStorage.getItem("userId") || 1;

  // ✅ Fetch favorites from backend
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const res = await axios.get(`/favorites/${userId}`, { withCredentials: true });
        const data = res?.data?.data || [];
        setFavorites(data);
      } catch (err) {
        console.error("Error fetching favorites:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchFavorites();
  }, [userId]);

  // ✅ Add to bag
  const handleAddToBag = (e) => {
    e.preventDefault();
    setBagAdded(true);
    setTimeout(() => setBagAdded(false), 2000);
  };

  // ✅ Remove favorite from backend
  const handleRemoveFavorite = async (productId, e) => {
    e.preventDefault();
    try {
      await axios.delete(`/favorites/remove`, {
        params: { userId, productId },
        withCredentials: true,
      });
      setFavorites((prev) => prev.filter((p) => p.product.id !== productId));
      setFavoriteRemoved(true);
      setTimeout(() => setFavoriteRemoved(false), 2000);
    } catch (err) {
      console.error("Error removing favorite:", err);
    }
  };

  const handleImageClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  return (
    <>
      <Navbar />

      {bagAdded && <div className="bag-alert">Added To Your Bag</div>}
      {favoriteRemoved && <div className="bag-alert">Removed From Favorite</div>}

      <section className="products-section">
        <div className="products-favorite">
          <h1 className="favorite-title">My Favorite</h1>
        </div>

        {loading ? (
          <p className="loading">Loading favorites...</p>
        ) : favorites.length === 0 ? (
          <p className="loading">No favorite products found.</p>
        ) : (
          <div className="products-grid">
            {favorites.map((fav) => {
              const product = fav.product || {};
              return (
                <div className="product-card" key={product.id}>
                  <div className="product-img-container" onClick={() => handleImageClick(product.id)}>
                    <img
                      id="image_favorite"
                      src={
                        product?.images?.[0]?.downloadUrl
                          ? `https://backend.skinme.store${product.images[0].downloadUrl}`
                          : ThirdImage
                      }
                      alt={product.name}
                      className="product-img"
                    />
                  </div>

                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-desc">{product.description || "No description available."}</p>
                    <p className="product-price">${product.price?.toFixed(2)}</p>

                    <div className="add_to_card_and_remove">
                      <div className="add_to_bag" onClick={handleAddToBag}>
                        <i className="fa-solid fa-bag-shopping" />
                      </div>
                      <p className="remove_favorite" onClick={(e) => handleRemoveFavorite(product.id, e)}>
                        remove
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
    </>
  );
};
