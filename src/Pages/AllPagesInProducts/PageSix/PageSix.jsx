// src/Pages/Products/Products.jsx
import ThirdImage from "../../../assets/third_image.png";
import Navbar from "../../../Components/Navbar/Navbar";
import Footer from "../../../Components/Footer/Footer";
import OneToTen from "../../../Components/oneToTen/OneToTen";
import "./PageSix.css"

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

const PageSix = () => {
  return (
    <>
      <Navbar />

      <section className="products-section">
        <div className="products-header">
          <h1 className="product-title">Our Products</h1>

          <div className="sort-dropdown">
            <label htmlFor="sortSelect">Sort By:</label>
            <select id="sortSelect" className="sort-select">
              <option>Default</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
            </select>
          </div>
        </div>

        <div className="products-grid">
          {mockProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-img-container">
                <img src={ThirdImage} alt={product.title} className="product-img" />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.title}</h3>
                <p className="product-desc">{product.desc}</p>
                <p className="product-price">${product.price.toFixed(2)}</p>
                <button className="add-to-cart">Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <OneToTen/>
      <Footer />
    </>
  );
};

export default PageSix;
