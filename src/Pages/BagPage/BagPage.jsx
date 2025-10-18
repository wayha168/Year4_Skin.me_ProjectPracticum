// src/Pages/BagPage/BagPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import "./BagPage.css";
import ThirdImage from "../../assets/third_image.png";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";

const mockProducts = [
  { id: 1, title: "Skin Care", desc: "Protect your skin from the sun", price: 9.99 },
  { id: 2, title: "Hydrating Cream", desc: "Keeps your skin moisturized", price: 14.99 },
  { id: 3, title: "Vitamin C Serum", desc: "Brightens and evens skin tone", price: 19.99 },
  { id: 4, title: "Sunscreen", desc: "SPF 50+ protection for daily use", price: 12.99 },
  { id: 5, title: "Cleanser", desc: "Removes dirt and excess oil", price: 8.99 },
  { id: 6, title: "Toner", desc: "Balances and refreshes your skin", price: 11.99 },
  { id: 7, title: "Night Cream", desc: "Restores your skin overnight", price: 17.49 },
  { id: 8, title: "Aloe Vera Gel", desc: "Soothes and cools irritation", price: 7.99 },
];

function BagPage() {
  const navigate = useNavigate();
  const [removedFromBag, setRemovedFromBag] = useState(false);

  const handleCheckOut = () => {
    navigate("/check_out"); // redirect to check_out page
  };

  const handleRemoveBag = (e) => {
    e.preventDefault();
    setRemovedFromBag(true);
    setTimeout(() => setRemovedFromBag(false), 2000);
  };
  const imageBagClick = () => {
    navigate("/check_out");
  };

  return (
    <>
      <Navbar />

      {/* ✅ Popup Alert */}
      {removedFromBag && <div className="remove_bag_alert">Removed From Bag</div>}

      <section className="products-section">
        <div className="products-favorite">
          <h1 className="favorite-title">My Bag</h1>
        </div>

        <div className="products-grid">
          {mockProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-img-container">
                <img onClick={imageBagClick} id="image_bag"  src={ThirdImage} alt={product.title} className="product-img" />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.title}</h3>
                <p className="product-desc">{product.desc}</p>
                <p className="product-price">${product.price.toFixed(2)}</p>

                <div className="add_to_card_and_remove">
                  <button
                    id="checkOut"
                    className="add-to-cart"
                    onClick={handleCheckOut}
                  >
                    Check Out
                  </button>
                  <p
                    id="remove_bag"
                    className="remove_favorite"
                    onClick={handleRemoveBag}
                  >
                    remove
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </>
  );
}

export default BagPage;
