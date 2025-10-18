// src/Pages/CheckOutPage/CheckOutPage.jsx
import React, { useState } from 'react';
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import ImageThree from '../../assets/third_image.png';
import ImageOne from '../../assets/first_image.png';
import ImageTwo from '../../assets/second_image.png';
import "./CheckOutPage.css";

function CheckOutPage() {
  const [quantity, setQuantity] = useState(1);
  const [showPopup, setShowPopup] = useState(false); // ✅ popup state
  const pricePerItem = 9.99;

  const increaseQuantity = () => setQuantity(prev => prev + 1);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleBuyNow = () => {
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // hide after 3s
  };

  const totalPrice = (pricePerItem * quantity).toFixed(2);

  return (
    <>
      {/* ✅ Popup */}
      {showPopup && (
        <div className="buy-popup">
          Successfully Bought!
        </div>
      )}

      <div className="image_and_price_amount">
        <div className="image_wrapper">
          <img className="image_three" src={ImageThree} alt="product" />
          <img className="image_three" src={ImageOne} alt="product" />
          <img className="image_three" src={ImageTwo} alt="product" />
        </div>

        <div className="price_and_amount_wrapper">
          <p className="skin_me">SKIN.ME</p>
          <p className="font_word">Hydrating Cream</p>
          <p className="font_word">${totalPrice}</p>

          <div className="plus_minus_wrapper">
            <p
              className={`font_word plus_minus k ${quantity === 1 ? 'disabled' : ''}`}
              onClick={decreaseQuantity}
              style={{ cursor: quantity === 1 ? 'not-allowed' : 'pointer', opacity: quantity === 1 ? 0.5 : 1 }}
            >
              -
            </p>
            <p className="font_word plus_minus">{quantity}</p>
            <p className="font_word plus_minus k" onClick={increaseQuantity} style={{ cursor: 'pointer' }}>
              +
            </p>
          </div>

          <div className="buy_now_wrapper">
            <p
              id='buy_now'
              className="buy_now"
              onClick={handleBuyNow} // ✅ trigger popup
            >
              Buy Now
            </p>
          </div>

          <div className="lorem">
            <p>
              SKIN.ME Hydrating Cream deeply nourishes and refreshes your skin, leaving it soft, smooth, and
              healthy-looking. Designed for daily use, it restores moisture balance and strengthens your skin’s
              natural barrier for long-lasting hydration.
            </p>
            <p>
              Made with natural ingredients and dermatologically tested, this cream suits all skin types and helps
              reduce dryness and dullness. Feel confident every day with skin that glows naturally and stays hydrated
              from morning to night.
            </p>
          </div>
        </div>
      </div>

      <Navbar />
      <Footer />
    </>
  );
}

export default CheckOutPage;
