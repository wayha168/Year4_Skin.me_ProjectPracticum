// src/Pages/Homepage/HomePage.jsx

// HomePage
import React from "react";
import "./HomePage.css";
import MainImage from "../../assets/product_homepage.png";

import FirstImage from "../../assets/first_image.png";
import SecondImage from "../../assets/second_image.png";
import ThirdImage from "../../assets/third_image.png";


// last green page images
import Aba from "../../assets/ABA.png"
import Acelida from "../../assets/acelida.png"
import Visa from "../../assets/Visa.png"
import Paypal from "../../assets/paypal.png"

// last green page SOCIAL image
import TIKTOK from "../../assets/tiktok_icon.png"
import TWITER from "../../assets/twitter_icon.png"
import FACEBOOK from "../../assets/facebook_icon_social.png"
import PINTEREST from "../../assets/pinterest_icon.png"
import INSTARGRAM from "../../assets/instargram_icon.png"

// to Products
  const scrollToProducts = (e) => {
  e.preventDefault();

  const scrollToSection = () => {
    const section = document.getElementById("products");
    if (section) {
      const navbarHeight = document.querySelector(".navbar-wrapper")?.offsetHeight || 0;
      const y = section.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  if (window.location.pathname === "/") {
    scrollToSection();
  } else {
    setTimeout(scrollToSection, 500);
  }
};

//  to About Us
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
    setTimeout(scrollToSection, 500);
  }
};


// HomePage
const HomePage = () => {
  
  return (<>
  <div className="homepage_main_wrapper">
    <div className="round_purple fourth">
      </div>
    <div id="homepage" className="homepage-container">
       <div className="round_purple first">
      </div>
       
      <div className="homepage_content_position">
        <div className="homepage-content">
          <p className="homepage-title">
            Welcome to SKIN.ME
          </p>
        </div>
        <div className="homepage-content">
          <p className="most_enssential">
            Most Essential Skin Care Product
          </p>
        </div>
        <div className="homepage-content">
          <p className="give_you_the">
          Give you the best skincare product is our mission.        </p>
        </div>
        <div className="homepage-content">
          <button onClick={scrollToProducts} className="shop_now">
            Shop Now
          </button>
        </div>
        </div>
       
       </div>
      <div className="main_image">
        <img  src={MainImage} alt="skin prduct" className="main_image_homepage"/>
      </div>
      <div className="round_purple second">
      </div>
      </div>
    {/* HomePage */}


    {/* OverViewPage */}
      <div className="main_overview_wrapper">
        <div className="mini_overview_wrapper">
            <div className="let_have_a">
             Let's Have A Look
          </div>
          <div className="this_is_the_overview">
              This is the overview about our products that you can spent few minutes to see how it look.  
          </div>
          <div className="the_two_images">
            <img className="first_image" src={FirstImage}/>
            <img className="second_image" src={SecondImage}/>
          </div>
      </div>
      
      <div  className="big_single_image">
        <img className="third_image" src={ThirdImage}/>
      </div>
      <div className="round_purple third">
      </div >
       
      </div>
      
    {/* OverViewPage */}





    {/* ProductPage */}
    <div id="products" className="main_product_wrapper">
      <div className="line first"></div>
      
      <div className="our_products">
        <p className="word_our_products">Our Products</p>
      </div>
      


      <div className="products_grid">
        
      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>
      </div>




      <div className="products_grid with_less_margin_top">
        
      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>
      </div>




      <div className="products_grid with_less_margin_top">
        
      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>
      </div>
      <div className="products_grid with_less_margin_top">
        
      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
        
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>

      <div className="product_word_wrapper">
        <div className="product_image_container">
        <img className="first_product_image" src={ThirdImage}/>
       </div>
        <p className="product_skincare">
          Skin Care
        </p>
        <p className="product_use_to_protect">
          Use to protet your skin from the sun
        </p>
        <p className="product_price">
          Price 9.99$
        </p>
      </div>
      </div>

      </div>
    {/* ProductPage */}


``    

    {/*About Us*/}
    <div id="aboutus" onClick={scrollToAboutUs} className="main_wrapper_about_us">
        <div className="mini_sentence_wrapper">
         <p className="word_about_us">About Us</p>
         <p className="sentent_skin_me_is">SKIN.ME is more than skincare — 
          it’s a daily ritual of self-respect
          and renewal. We craft minimalist,
          effective formulas designed for 
          real skin and real lives. Inspired
          by nature and backed by science,
          our products are gentle yet powerful. 
          Every bottle reflects our commitment
          to clean ingredients and honest beauty. Join us in redefining skincare with simplicity, confidence, and care.</p>
        </div>
        <div className="about_us_image_wrapper">
          <img className="about_us_image the_first_image" src={FirstImage}/>
          <img className="about_us_image the_second_image" src={SecondImage}/>
          <img className="about_us_image the_third_image" src={ThirdImage}/>
          <img className="about_us_image the_fourth_image" src={FirstImage}/>
        </div>
      </div>

    {/*About Us*/}





    {/* Last green page */}

    {/* SKIN.ME */}
    <div className="wrapp_with_c">
    <div className="main_green_page_wrapper">
        <div className="logo_card_wrapper">
          <p className="last_page_skinme_word las_skin_me">SKIN.ME</p>
          <div className="payment_card_wrapper">
            <img src={Aba}/>
            <img src={Visa}/>
            <img src={Paypal}/>
            <img src={Acelida}/>
          </div>
          <div className="new_letters_wrapper"> 
            <p className="newletters">NEWLETTERS</p>
            <p className="subscribe_to_receive">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="email_and_button_wrapper">
              <input className="enter_your_email" type="email" placeholder="Enter your email" />
              <button className="subscribe_button" >Subscribe</button>
            </div>
            </div>
        </div>

      {/* GENERAL */}
        <div className="logo_card_wrapper">
          <p className="last_page_skinme_word ">GENERAL</p>
          <div className="payment_card_wrapper general">
            <p className="word_in_general location">Location</p>
            <p className="word_in_general privacy_Policy">Privacy Policy</p>
            <p className="word_in_general cookie">Cookie</p>
          </div>
        </div>

        {/* GET TO KNOW US */}
        <div className="logo_card_wrapper">
          <p className="last_page_skinme_word get_to_know ">GET TO KNOW US</p>
          <div className="payment_card_wrapper general">
            <p className="word_in_general location">About</p>
            <p className="word_in_general privacy_Policy">Blog</p>
            <p className="word_in_general cookie">Email:mrjr@gmail.com</p>
            <p className="word_in_general cookie">Phone: 098249823</p>
          </div>
        </div>


        {/* SOCIAL */}
        <div className="logo_card_wrapper social">
          <p className="last_page_skinme_word social">SOCIAL</p>
          <div className="payment_card_wrapper icons">
            <img className="social_icons" src={TIKTOK}/>
            <img className="social_icons" src={FACEBOOK}/>
            <img className="social_icons" src={INSTARGRAM}/>
            <img className="social_icons" src={PINTEREST}/>
            <img className="social_icons" src={TWITER}/>
          </div>
        </div>
      </div >
      <div className="the_last_sentence_wrapper">
        <p className="the_last_sentent">© SKIN.ME Only sell you the great product</p>
      </div>
      </div>

      
    {/* Last green page */}

    </>
  );
};

export default HomePage;
