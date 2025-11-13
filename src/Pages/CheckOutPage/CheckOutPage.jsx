// src/Pages/CheckOutPage/CheckOutPage.jsx
import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import MessageWidget from "../../Components/MessageWidget/MessageWidget";
import "./CheckOutPage.css";
import DiliveryAndPayment from "../../Components/DiliveryAndPayment/DiliveryAndPayment";

function CheckOutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, quantity } = location.state || {};
  const [showModal, setShowModal] = useState(false);
  const modalRef = useRef(null); // <-- Ref to detect outside clicks

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

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShowModal(false);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showModal]);

  return (
    <>
      <Navbar />

      <div className="checkout-page">
        <div className="checkout-container">
          <h2 className="checkout-title">Your Bag</h2>

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
              <button className="pay-btn" onClick={() => setShowModal(true)}>
                Proceed to Payment
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <MessageWidget />

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-end bg-black bg-opacity-50 z-50">
          <div
            ref={modalRef}
            className="pt-20 relative bg-white p-0 max-w-lg w-full max-h-[100vh] overflow-y-auto"
          >
            <DiliveryAndPayment totalPrice={totalPrice} onClose={() => setShowModal(false)} />
          </div>
        </div>
      )}  
    </>
  );
}

export default CheckOutPage;