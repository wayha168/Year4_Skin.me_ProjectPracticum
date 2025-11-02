import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import MessageWidget from "../../Components/MessageWidget/MessageWidget";
import "./CheckOutPage.css";

function CheckOutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity } = location.state || {};

  if (!product) {
    return (
      <div className="no-product">
        <p>No product selected for checkout.</p>
        <button className="back-btn" onClick={() => navigate("/products")}>
          Go Back to Products
        </button>
      </div>
    );
  }

  const totalPrice = (product.price * quantity).toFixed(2);

  const handlePayment = () => {
    alert(`Proceeding to payment for ${product.name} ($${totalPrice})`);
  };

  return (
    <>
      <Navbar />

      <div className="checkout-page">
        <div className="checkout-container">
          <h2 className="checkout-title">🛍️ Your Bag</h2>

          <div className="checkout-card">
            <div className="checkout-item">
              <img
                src={`https://backend.skinme.store${product.images?.[0]?.downloadUrl}`}
                alt={product.name}
                className="checkout-image"
              />

              <div className="checkout-info">
                <h3>{product.name}</h3>
                <p className="brand">Brand: {product.brand?.name || "Unknown"}</p>
                <p className="price">${product.price}</p>
                <p>Quantity: {quantity}</p>
                <p className="total">Total: ${totalPrice}</p>
              </div>
            </div>

            <div className="checkout-actions">
              <button className="back-btn" onClick={() => navigate(-1)}>
                ← Continue Shopping
              </button>
              <button className="pay-btn" onClick={handlePayment}>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <MessageWidget />
    </>
  );
}

export default CheckOutPage;
