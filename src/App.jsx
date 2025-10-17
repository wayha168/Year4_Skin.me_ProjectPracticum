// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./Pages/HomePage/HomePage";
import Login from "./Authentication/Login";
import Signup from "./Authentication/Signup";
import Dashboard from "./Dashboard/Dashboard";
import ProductCrud from "./Dashboard/ProductCrud";
import { OrderControl } from "./Dashboard/OrderControl";
import ImageCrud from "./Dashboard/ImageCrud";
import CategoryCrud from "./Dashboard/CategoryCrud";
import Products from "./Pages/Products/Products";
import AboutUsPage from "./Pages/AboutUs/AboutUsPage";
import { FavoritePage } from "./Pages/FavoritePage/FavoritePage";
import BagPage from "./Pages/BagPage/BagPage";
import PageTwo from "./Pages/AllPagesInProducts/PageTwo/PageTwo";
import "./index.css";
import PageThree from "./Pages/AllPagesInProducts/PageThree/PageThree";

import PageFour from "./Pages/AllPagesInProducts/PageFour/PageFour";
import PageFive from "./Pages/AllPagesInProducts/PageFive/PageFive";
import PageSix from "./Pages/AllPagesInProducts/PageSix/PageSix";
import PageSeven from "./Pages/AllPagesInProducts/PageSeven/PageSeven";
import PageEight from "./Pages/AllPagesInProducts/PageEight/PageEight";
import PageNine from "./Pages/AllPagesInProducts/PageNine/PageNine";
import PageTen from "./Pages/AllPagesInProducts/PageTen/PageTen";


import CheckOutPage from "./Pages/CheckOutPage/CheckOutPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/products" element={<Products />} />
      <Route path="/about-us" element={<AboutUsPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/bag_page" element={<BagPage />} />
      <Route path="/page/:num" element={<PageTwo />} />
      <Route path="/favorite" element={<FavoritePage />} />


      {/* one to ten page in */}
      <Route path="/page/:num" element={<PageTwo />} />  // pages 1,3,4...
      <Route path="/page_two" element={<PageTwo />} />   
      <Route path="/page_three" element={<PageThree />} />  
      <Route path="/page_four" element={<PageFour />} />
      <Route path="/page_five" element={<PageFive />} />
      <Route path="/page_six" element={<PageSix />} />
      <Route path="/page_seven" element={<PageSeven />} />
      <Route path="/page_eight" element={<PageEight />} />
      <Route path="/page_nine" element={<PageNine />} />
      <Route path="/page_ten" element={<PageTen />} /> 
       <Route path="/page/1" element={<Products />} />

      {/* checkout */}
      <Route path="/check_out" element={<CheckOutPage />} />



      {/* Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/product-crud" element={<ProductCrud />} />
      <Route path="/order-control" element={<OrderControl />} />
      <Route path="/image-crud" element={<ImageCrud />} />
      <Route path="/category-crud" element={<CategoryCrud />} />

      

      {/* Redirects */}
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<div className="text-center mt-20 text-2xl font-semibold">404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;
