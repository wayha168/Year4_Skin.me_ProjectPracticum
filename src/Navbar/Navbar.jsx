// src/Navbar/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthContext from "../Authentication/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const scrollToHome = (e) => {
  e.preventDefault();


  

// Direct to HomePage
  const scrollToSection = () => {
    const section = document.getElementById("homepage");
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


// Direct to product Product
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
    navigate("/");
    setTimeout(scrollToSection, 500);
  }
};



// Direct to AboutUs
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




const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef(null); // reference for nav content

  const handleLogout = () => {
    logout(); 
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="navbar-wrapper">
      <div className="navbar-content" ref={navRef}>
        {/* Logo Section */}
        <Link
            to="/"
            className="brand-logo"
            onClick={(e) => {
              e.preventDefault();

              const scrollToSection = () => {
                const section = document.getElementById("homepage");
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
            }}>
          <span className="brand-name">SKIN.ME</span>
          <span className="brand-tagline">@Home Of Your Care</span>
        </Link>

        {/* Hamburger Icon */}
        <div className="main-dropdown" onClick={toggleMenu}>
          <i className="fa-solid fa-bars hamburger-icon"></i>
        </div>

        {/* Main Navigation */}
        <div className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <Link to="/" onClick={scrollToHome} className="nav-item">Home</Link>
          <Link onClick={scrollToProducts} to="/products" className="nav-item">
            Products <i className="fa-solid fa-caret-down" />
          </Link>
          <Link to="/about"  onClick={scrollToAboutUs} className="nav-item">About Us</Link>
        </div>

        {/* Auth Section */}
        <div className={`auth-menu ${menuOpen ? "active" : ""}`}>
          {user ? (
            <>
              <Link to="/profile" className="auth-button profile-button">Profile</Link>
              <button onClick={handleLogout} className="auth-button logout-button">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-button login-button">Login</Link>
              <Link to="/signup" className="auth-button signup-button">Sign Up</Link>
              <div className="icons heart">
                <i className="fa-solid fa-heart" />
              </div>
              <div className="icons bag">
                <i className="fa-solid fa-bag-shopping" />
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;