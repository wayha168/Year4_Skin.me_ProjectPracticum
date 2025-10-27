import Navbar from "../../Components/Navbar/Navbar";
import Footer from "../../Components/Footer/Footer";
import "./AboutUsPage.css";
import TeamImage from "../../assets/second_image.png";
import MessageButton from "../../Components/MessageButton/MessageButton";
const AboutUsPage = () => {
  return (
    <>
      <Navbar />
      <div className="aboutuspage_wrapper">
        <div className="aboutus_content">
          <h1 className="aboutus_title">About SKIN.ME</h1>
          <p className="aboutus_paragraph">
            At SKIN.ME, we believe skincare should be simple, honest, and effective. We craft premium products
            from natural ingredients designed to enhance your skin’s natural glow. Our mission is to redefine
            skincare by merging science with nature — so every product supports real confidence and beauty
            that lasts.
          </p>
        </div>
        <div className="aboutus_image">
          <img src={TeamImage} alt="Team" />
        </div>
      </div>
      <Footer />
      <MessageButton/>
    </>
  );
};

export default AboutUsPage;
