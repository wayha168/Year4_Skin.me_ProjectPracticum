import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./BagPage.css";
import ThirdImage from "../../assets/third_image.png";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import axios from "../../api/axiosConfig";

function BagPage() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [removedFromBag, setRemovedFromBag] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await axios.get("/carts/my-cart", { withCredentials: true });
        const itemsArray = Array.isArray(res.data.data.items)
          ? res.data.data.items
          : Array.from(res.data.data.items || []);
        setCartItems(itemsArray);
      } catch (err) {
        console.error("Error fetching cart:", err);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, []);

  // ✅ Clear cart
  const handleRemoveBag = async (e) => {
    e.preventDefault();
    try {
      await axios.delete("/carts/my-cart/clear", { withCredentials: true });
      setCartItems([]);
      setRemovedFromBag(true);
      setTimeout(() => setRemovedFromBag(false), 2000);
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const handleCheckOut = () => {
    navigate("/check_out");
  };

  const getProductImage = (item) => {
    const imageUrl = item?.product?.images?.[0]?.downloadUrl;
    return imageUrl ? `https://backend.skinme.store${imageUrl}` : ThirdImage;
  };

  return (
    <>
      <Navbar />

      {removedFromBag && <div className="remove_bag_alert">Removed From Bag</div>}

      <section className="products-section h-auto min-h-screen py-8 px-4 bg-gray-100">
        <div className="products-favorite">
          <h1 className="favorite-title">My Bag</h1>
        </div>

        {loading ? (
          <p className="loading">Loading your cart...</p>
        ) : cartItems.length === 0 ? (
          <p className="loading">Your bag is empty.</p>
        ) : (
          <div className="products-grid">
            {cartItems.map((item) => (
              <div className="product-card" key={item.id}>
                <div className="product-img-container">
                  <img
                    onClick={handleCheckOut}
                    src={getProductImage(item)}
                    alt={item.product.name}
                    className="product-img"
                  />
                </div>

                <div className="product-info">
                  <h3 className="product-name">{item.product.name}</h3>
                  <p className="product-desc">{item.product.description}</p>
                  <p className="product-price">${item.product.price?.toFixed(2)}</p>
                  <p className="product-qty">Quantity: {item.quantity}</p>

                  <div className="add_to_card_and_remove">
                    <button className="add-to-cart" onClick={handleCheckOut}>
                      Check Out
                    </button>
                    <p className="remove_favorite" onClick={handleRemoveBag}>
                      remove
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <Footer />
    </>
  );
}

export default BagPage;
