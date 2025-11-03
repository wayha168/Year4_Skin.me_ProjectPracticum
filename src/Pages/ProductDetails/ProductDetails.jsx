import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import MessageWidget from "../../Components/MessageWidget/MessageWidget";
import "./ProductDetails.css";

function ProductDetails() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;

  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);

  useEffect(() => {
    if (product?.brand?.id) {
      fetch(`https://backend.skinme.store/api/v1/products?brandId=${product.brand.id}`)
        .then((res) => res.json())
        .then((data) => setRelatedProducts(data.filter((p) => p.id !== product.id)))
        .catch((err) => console.error("Failed to load related products:", err));
    }
  }, [product]);

  console.log(product);
  if (!product) {
    return (
      <div className="no-product">
        <p>No product selected.</p>
      </div>
    );
  }

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () => quantity > 1 && setQuantity((prev) => prev - 1);

  const totalPrice = (product.price * quantity).toFixed(2);

  const handleCheckout = () => {
    const user = localStorage.getItem("user"); // or "token" depending on your login logic

    if (!user) {
      alert("Please log in before checking out!");
      navigate("/login");
      return;
    }

    navigate("/check_out", { state: { product, quantity } });
  };

  return (
    <>
      <Navbar />

      <section className="product-details-container">
        {/* Product Images */}
        <div className="product-images">
          {product.images?.length ? (
            product.images.map((img, idx) => (
              <img
                key={idx}
                src={`https://backend.skinme.store${img.downloadUrl}`}
                alt={product.name}
                className="detail-image"
              />
            ))
          ) : (
            <img src="/placeholder.png" alt="No image" className="detail-image" />
          )}
        </div>

        {/* Product Info */}
        <div className="product-info-section">
          <h2>{product.name}</h2>
          <p className="brand-name">Brand: {product?.brand || "Unknown"}</p>
          <p className="price">${totalPrice}</p>

          {/* Quantity controls */}
          <div className="quantity-wrapper">
            <button onClick={decreaseQuantity} disabled={quantity === 1}>
              -
            </button>
            <span>{quantity}</span>
            <button onClick={increaseQuantity}>+</button>
          </div>

          <button className="checkout-btn" onClick={handleCheckout}>
            Check Out
          </button>

          {/* Product Description */}
          <div className="product-description">
            <h4>Description</h4>
            <p>{product.description || "No description available."}</p>
          </div>

          <p className="made-in">🌸 Made in Korea</p>
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="related-section">
          <h3>More from {product?.brand}</h3>
          <div className="related-grid">
            {relatedProducts.map((item) => (
              <div
                key={item.id}
                className="related-card"
                onClick={() => navigate("/product_details", { state: { product: item } })}
              >
                <img
                  src={`https://backend.skinme.store${item.images?.[0]?.downloadUrl}`}
                  alt={item.name}
                  className="related-image"
                />
                <p className="related-name">{item.name}</p>
                <p className="related-price">${item.price}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Footer />
      <MessageWidget />
    </>
  );
}

export default ProductDetails;
