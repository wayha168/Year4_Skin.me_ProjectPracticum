import React from "react";
import "./Footer.css";

import Aba from "../../assets/ABA.png";
import Acelida from "../../assets/acelida.png";
import Visa from "../../assets/Visa.png";
import Paypal from "../../assets/paypal.png";
import TIKTOK from "../../assets/tiktok_icon.png";
import TWITER from "../../assets/twitter_icon.png";
import FACEBOOK from "../../assets/facebook_icon_social.png";
import PINTEREST from "../../assets/pinterest_icon.png";
import INSTARGRAM from "../../assets/instargram_icon.png";

const Footer = () => {
  return (
    <div className="wrapp_with_c">
      <div className="main_green_page_wrapper">
        {/* SKIN.ME Section */}
        <div className="logo_card_wrapper">
          <p className="last_page_skinme_word las_skin_me">SKIN.ME</p>
          <div className="payment_card_wrapper">
            <img src={Aba} alt="ABA" />
            <img src={Visa} alt="Visa" />
            <img src={Paypal} alt="Paypal" />
            <img src={Acelida} alt="Acelida" />
          </div>
          <div className="new_letters_wrapper">
            <p className="newletters">NEWSLETTER</p>
            <p className="subscribe_to_receive">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <div className="email_and_button_wrapper">
              <input className="enter_your_email" type="email" placeholder="Enter your email" />
              <button className="subscribe_button">Subscribe</button>
            </div>
          </div>
        </div>

        {/* GENERAL */}
        <div className="logo_card_wrapper">
          <p className="last_page_skinme_word">GENERAL</p>
          <div className="payment_card_wrapper general">
            <p className="word_in_general location">Location</p>
            <p className="word_in_general privacy_Policy">Privacy Policy</p>
            <p className="word_in_general cookie">Cookie</p>
          </div>
        </div>

        {/* GET TO KNOW US */}
        <div className="logo_card_wrapper">
          <p className="last_page_skinme_word get_to_know">GET TO KNOW US</p>
          <div className="payment_card_wrapper general">
            <p className="word_in_general location">About</p>
            <p className="word_in_general privacy_Policy">Blog</p>
            <p className="word_in_general cookie">Email: mrjr@gmail.com</p>
            <p className="word_in_general cookie">Phone: 098249823</p>
          </div>
        </div>

        {/* SOCIAL */}
        <div className="logo_card_wrapper social">
          <p className="last_page_skinme_word social">SOCIAL</p>
          <div className="payment_card_wrapper icons">
            <img className="social_icons" src={TIKTOK} alt="TikTok" />
            <img className="social_icons" src={FACEBOOK} alt="Facebook" />
            <img className="social_icons" src={INSTARGRAM} alt="Instagram" />
            <img className="social_icons" src={PINTEREST} alt="Pinterest" />
            <img className="social_icons" src={TWITER} alt="Twitter" />
          </div>
        </div>
      </div>

      <div className="the_last_sentence_wrapper">
        <p className="the_last_sentent">© SKIN.ME — Only sell you the great product</p>
      </div>
    </div>
  );
};

export default Footer;
