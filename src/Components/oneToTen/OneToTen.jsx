// src/Components/oneToTen/OneToTen.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./OneToTen.css";

function OneToTen() {
  const totalPages = 10; // support pages 1–10
  const visibleCount = 4; // show 4 numbers at a time
  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const [start, setStart] = useState(1);

  // map route path to page number
  const routeToPage = (path) => {
    switch (path) {
      case "/products":
        return 1;
      case "/page_two":
        return 2;
      case "/page_three":
        return 3;
      case "/page_four":
        return 4;
      case "/page_five":
        return 5;
      case "/page_six":
        return 6;
      case "/page_seven":
        return 7;
      case "/page_eight":
        return 8;
      case "/page_nine":
        return 9;
      case "/page_ten":
        return 10;
      default:
        return 1;
    }
  };

  // map page number to route
  const pageToRoute = (num) => {
    switch (num) {
      case 1:
        return "/products";
      case 2:
        return "/page_two";
      case 3:
        return "/page_three";
      case 4:
        return "/page_four";
      case 5:
        return "/page_five";
      case 6:
        return "/page_six";
      case 7:
        return "/page_seven";
      case 8:
        return "/page_eight";
      case 9:
        return "/page_nine";
      case 10:
        return "/page_ten";
      default:
        return "/products";
    }
  };

  // update active page based on URL
  useEffect(() => {
    const page = routeToPage(location.pathname);
    setCurrentPage(page);
    setStart(page > 2 ? page - 1 : 1);
  }, [location.pathname]);

  const handleNumberClick = (num) => {
    setCurrentPage(num);
    setStart(num > 2 ? num - 1 : 1);
    navigate(pageToRoute(num));
  };

  const handlePrev = () => currentPage > 1 && handleNumberClick(currentPage - 1);
  const handleNext = () => currentPage < totalPages && handleNumberClick(currentPage + 1);

  // calculate visible numbers
  const visiblePages = Array.from({ length: visibleCount }, (_, i) => start + i).filter(
    (n) => n <= totalPages
  );

  return (
    <div className="one_to_ten_page">
      <p className={`move_left ${currentPage === 1 ? "disabled" : ""}`} onClick={handlePrev}>
        {"<"}
      </p>

      {visiblePages.map((num) => (
        <p
          key={num}
          className={`Number ${currentPage === num ? "active" : ""}`}
          onClick={() => handleNumberClick(num)}
        >
          {num}
        </p>
      ))}

      {visiblePages[visiblePages.length - 1] < totalPages && <p className="Number dot">...</p>}

      <p
        className={`move_right ${currentPage === totalPages ? "disabled" : ""}`}
        onClick={handleNext}
      >
        {">"}
      </p>
    </div>
  );
}

export default OneToTen;
