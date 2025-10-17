import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthContext from "../../Authentication/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ignoreScroll, setIgnoreScroll] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (ignoreScroll) return;
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, ignoreScroll]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleLogout = () => logout();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const safeNavigate = (path) => {
    setIgnoreScroll(true);
    setVisible(true);
    navigate(path);
    setMenuOpen(false);
    setTimeout(() => setIgnoreScroll(false), 500);
  };

  const goToPageAndSection = (pagePath, sectionId, offsetVh = 0) => {
    setIgnoreScroll(true);
    setVisible(true);

    const scrollToSection = () => {
      const section = document.getElementById(sectionId);
      if (section) {
        const offsetPx = (offsetVh / 100) * window.innerHeight;
        const y = section.getBoundingClientRect().top + window.scrollY - offsetPx;
        window.scrollTo({ top: y, behavior: "auto" });
      }
      setTimeout(() => setIgnoreScroll(false), 300);
    };

    if (window.location.pathname !== pagePath) {
      navigate(pagePath);
      setTimeout(scrollToSection, 300);
    } else {
      scrollToSection();
    }
    setMenuOpen(false);
  };

  return (
    <nav className="navbar-wrapper" style={{ top: visible ? "0" : "-100px" }}>
      <div className="navbar-content" ref={navRef}>
        {/* Logo */}
        <Link
          to="/"
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            goToPageAndSection("/", "homepage", 5);
          }}
        >
          <span className="brand-name">SKIN.ME</span>
          <span className="brand-tagline">@Home Of Your Care</span>
        </Link>

        <div className="main-dropdown" onClick={toggleMenu}>
          <i className="fa-solid fa-bars hamburger-icon"></i>
        </div>

        {/* Menu */}
        <div className={`nav-menu ${menuOpen ? "active" : ""}`}>
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              goToPageAndSection("/", "homepage", 5);
            }}
            className="nav-item"
          >
            Home
          </Link>

          <Link
            to="/products"
            onClick={(e) => {
              e.preventDefault();
              safeNavigate("/products");
            }}
            className="nav-item"
          >
            Products
          </Link>

          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              goToPageAndSection("/", "aboutus", 10);
            }}
            className="nav-item"
          >
            About Us
          </Link>
        </div>

        {/* Auth Section */}
        <div className={`auth-menu ${menuOpen ? "active" : ""}`}>
          {user ? (
            <>
              <Link to="/profile" className="auth-button profile-button">
                Profile
              </Link>
              <button onClick={handleLogout} className="auth-button logout-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="auth-button login-button">
                Login
              </Link>
              <Link to="/signup" className="auth-button signup-button">
                Sign Up
              </Link>
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
