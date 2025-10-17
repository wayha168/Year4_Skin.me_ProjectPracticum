import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import Navbar from "../../Components/Navbar/Navbar.jsx";
import Footer from "../../Components/Footer/Footer.jsx";

import MainImage from "../../assets/product_homepage.png";
import FirstImage from "../../assets/first_image.png";
import SecondImage from "../../assets/second_image.png";
import ThirdImage from "../../assets/third_image.png";

const HomePage = () => {
  const navigate = useNavigate();
  const goToProducts = (e) => {
    e.preventDefault();
    navigate("/products");
  };

  const scrollToSection = () => {
    const section = document.getElementById("product");
    if (section) {
      const navbarHeight = document.querySelector(".navbar-wrapper")?.offsetHeight || 0;
      const y = section.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (window.location.pathname === "/") {
    scrollToSection();
  } else {
    navigate("/product");
  }
  const scrollToAboutUs = (e) => {
    e.preventDefault();

    const scrollToSection = () => {
      const section = document.getElementById("aboutus");
      if (section) {
        const navbarHeight = document.querySelector(".navbar-wrapper")?.offsetHeight || 0;
        const y = section.getBoundingClientRect().top + window.scrollY - navbarHeight;
        window.scrollTo({ top: y, behavior: "smooth" });
      }
    };

    if (window.location.pathname === "/") {
      scrollToSection();
    } else {
      navigate("/");
      setTimeout(scrollToSection, 500);
    }
  };

  return (
    <>
      <Navbar />
      {/* HomePage */}
      <div className="homepage_main_wrapper h-auto min-h-screen py-8 px-4 bg-gray-100">
        <div className="round_purple fourth"></div>
        <div id="homepage" className="homepage-container">
          <div className="round_purple first"></div>

          <div className="homepage_content_position">
            <div className="homepage-content">
              <p className="homepage-title">Welcome to SKIN.ME</p>
            </div>
            <div className="homepage-content">
              <p className="most_enssential">Most Essential Skin Care Product</p>
            </div>
            <div className="homepage-content">
              <p className="give_you_the">Give you the best skincare product is our mission. </p>
            </div>
            <div className="homepage-content">
              <button onClick={goToProducts} className="shop_now">
                Shop Now
              </button>
            </div>
          </div>
        </div>
        <div className="main_image">
          <img src={MainImage} alt="skin prduct" className="main_image_homepage" />
        </div>
        <div className="round_purple second"></div>
      </div>
      {/* HomePage */}
      <div className="main_overview_wrapper">
        <div className="mini_overview_wrapper">
          <div className="let_have_a">Let's Have A Look</div>
          <div className="this_is_the_overview">
            This is the overview about our products that you can spent few minutes to see how it look.
          </div>
          <div className="the_two_images">
            <img className="first_image" src={FirstImage} />
            <img className="second_image" src={SecondImage} />
          </div>
        </div>

        <div className="big_single_image">
          <img className="third_image" src={ThirdImage} />
        </div>
        <div className="round_purple third"></div>
      </div>
      {/* ProductPage */}
      <div id="product" className="main_product_wrapper m-3">
        <div className="line first"></div>

        <div className="our_products">
          <p className="word_our_products">Our Products</p>
        </div>

        <div className="products_grid">
          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>

          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>

          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>

          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>
        </div>

        <div className="products_grid with_less_margin_top">
          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>

          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>

          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>

          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>
        </div>

        <div className="products_grid with_less_margin_top">
          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>

          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>

          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>

          <div className="product_word_wrapper">
            <div className="product_image_container">
              <img className="first_product_image" src={ThirdImage} />
            </div>
            <p className="product_skincare">Skin Care</p>
            <p className="product_use_to_protect">Use to protet your skin from the sun</p>
            <p className="product_price">Price 9.99$</p>
          </div>
        </div>

        <div className="button_and_grid_wrapper">
          <div className="products_grid with_less_margin_top">
            <div className="product_word_wrapper">
              <div className="product_image_container">
                <img className="first_product_image" src={ThirdImage} />
              </div>
              <p className="product_skincare">Skin Care</p>
              <p className="product_use_to_protect">Use to protet your skin from the sun</p>
              <p className="product_price">Price 9.99$</p>
            </div>

            <div className="product_word_wrapper">
              <div className="product_image_container">
                <img className="first_product_image" src={ThirdImage} />
              </div>
              <p className="product_skincare">Skin Care</p>
              <p className="product_use_to_protect">Use to protet your skin from the sun</p>
              <p className="product_price">Price 9.99$</p>
            </div>

            <div className="product_word_wrapper">
              <div className="product_image_container">
                <img className="first_product_image" src={ThirdImage} />
              </div>
              <p className="product_skincare">Skin Care</p>
              <p className="product_use_to_protect">Use to protet your skin from the sun</p>
              <p className="product_price">Price 9.99$</p>
            </div>

            <div className="product_word_wrapper">
              <div className="product_image_container">
                <img className="first_product_image" src={ThirdImage} />
              </div>
              <p className="product_skincare">Skin Care</p>
              <p className="product_use_to_protect">Use to protet your skin from the sun</p>
              <p className="product_price">Price 9.99$</p>
            </div>
          </div>
          <div className="view_products">
            <button to="/products" onClick={goToProducts} className="view_products_button">
              View Product
            </button>
          </div>
        </div>
      </div>
      {/* ProductPage */}
      ``
      {/*About Us*/}
      <div id="aboutus" onClick={scrollToAboutUs} className="main_wrapper_about_us">
        <div className="mini_sentence_wrapper">
          <p className="word_about_us">About Us</p>
          <p className="sentent_skin_me_is">
            SKIN.ME is more than skincare — it’s a daily ritual of self-respect and renewal. We craft
            minimalist, effective formulas designed for real skin and real lives. Inspired by nature and
            backed by science, our products are gentle yet powerful. Every bottle reflects our commitment to
            clean ingredients and honest beauty. Join us in redefining skincare with simplicity, confidence,
            and care.
          </p>
        </div>
        <div className="about_us_image_wrapper">
          <img className="about_us_image the_first_image" src={FirstImage} />
          <img className="about_us_image the_second_image" src={SecondImage} />
          <img className="about_us_image the_third_image" src={ThirdImage} />
          <img className="about_us_image the_fourth_image" src={FirstImage} />
        </div>
      </div>
      {/*About Us*/}
      <Footer />
    </>
  );
};

export default HomePage;
