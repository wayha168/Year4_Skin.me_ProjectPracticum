// src/Pages/CheckOutPage/CheckOutPage.jsx
import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';   // <-- add this
import Navbar from '../../Components/Navbar/Navbar';
import Footer from '../../Components/Footer/Footer';
import ImageThree from '../../assets/third_image.png';
import ImageOne from '../../assets/first_image.png';
import ImageTwo from '../../assets/second_image.png';
import MessageButton from '../../Components/MessageWidget/MessageWidget';
import { Link } from 'react-router-dom';
import './CheckOutPage.css';

function CheckOutPage() {
  const [quantity, setQuantity] = useState(1);
  const pricePerItem = 9.99;
  // const navigate = useNavigate();               // <-- hook for navigation

  const increaseQuantity = () => setQuantity(prev => prev + 1);

  const decreaseQuantity = () => {
    if (quantity > 1) setQuantity(prev => prev - 1);
  };

  // ---- NEW: redirect on Buy Now ----
  // const handleBuyNow = () => {
  //   navigate('/delivery_payment');   // <-- change this path if needed
  // };

  const totalPrice = (pricePerItem * quantity).toFixed(2);

  return (
    <>
      {/* Popup removed – no longer needed */}

      <div className="image_and_price_amount">
        <div className="image_wrapper">
          <img className="image_three" src={ImageThree} alt="product" />
          <img className="image_three" src={ImageOne} alt="product" />
          <img className="image_three" src={ImageTwo} alt="product" />
        </div>

        <div className="price_and_amount_wrapper">
          <p className="font_word hydrating">
            Hydrating Cream <br /><br />
          </p>
          <p className="font_word">${totalPrice}</p>

          <div className="amount_and_buynow_wrapper">
            {/* ----- Quantity controls ----- */}
            <div className="plus_minus_wrapper">
              <p
                className={`font_word plus_minus k ${quantity === 1 ? 'disabled' : ''}`}
                onClick={decreaseQuantity}
                style={{
                  cursor: quantity === 1 ? 'not-allowed' : 'pointer',
                  opacity: quantity === 1 ? 0.5 : 1,
                }}
              >
                -
              </p>
              <p className="font_word plus_minus">{quantity}</p>
              <p
                className="font_word plus_minus k"
                onClick={increaseQuantity}
                style={{ cursor: 'pointer' }}
              >
                +
              </p>
            </div>

            {/* ----- Check Out button ----- */}
            <Link
              className="buy_now_wrapper"
              to="/delivery_payment"         // <-- navigation here
              style={{ cursor: 'pointer' }}   // make it obvious it’s clickable
            >
              <p id="buy_now"  className="buy_now">
                Check Out
              </p>
            </Link>
          </div>

          <div className="lorem">
            <p>
              SKIN.ME Hydrating Cream deeply nourishes and refreshes your skin,
              leaving it soft, smooth, and healthy-looking. Designed for daily
              use, it restores moisture balance and strengthens your skin’s
              natural barrier for long-lasting hydration.
            </p>
          </div>

          <div className="made_in">
            <p>. Made in Korea</p>
          </div>
        </div>
      </div>

      <Navbar />
      <Footer />
      <MessageButton />
    </>
  );
}

export default CheckOutPage;