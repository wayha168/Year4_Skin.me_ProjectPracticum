// src/Components/Navbar/Navbar.jsx
import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthContext from "../../Authentication/AuthContext";
import Loading from "../Loading/Loading";
import "./Navbar.css";

const Navbar = ({ alwaysVisible = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ignoreScroll, setIgnoreScroll] = useState(false);
  const navRef = useRef(null);

  // Scroll behavior
  useEffect(() => {
    if (alwaysVisible) return;
    const handleScroll = () => {
      if (ignoreScroll) return;
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, ignoreScroll, alwaysVisible]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  const handleLogout = () => logout();

  const safeNavigate = (path) => {
    setIgnoreScroll(true);
    setVisible(true);
    setLoading(true);
    navigate(path);
    setMenuOpen(false);
    setTimeout(() => {
      setIgnoreScroll(false);
      setLoading(false);
    }, 700);
  };

  const goToPageAndSection = (pagePath, sectionId, offsetVh = 0) => {
    setIgnoreScroll(true);
    setVisible(true);
    setLoading(true);

    const scrollToSection = () => {
      const section = document.getElementById(sectionId);
      if (section) {
        const offsetPx = (offsetVh / 100) * window.innerHeight;
        const y = section.getBoundingClientRect().top + window.scrollY - offsetPx;
        window.scrollTo({ top: y, behavior: "auto" });
      }
      setTimeout(() => {
        setIgnoreScroll(false);
        setLoading(false);
      }, 500);
    };

    if (window.location.pathname !== pagePath) {
      navigate(pagePath);
      setTimeout(scrollToSection, 500);
    } else {
      scrollToSection();
    }
    setMenuOpen(false);
  };

  return (
    <>
      <nav className="navbar-wrapper" style={{ top: visible || alwaysVisible ? "0" : "-100px" }}>
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

          {/* Hamburger menu toggle */}
          <div className="main-dropdown" onClick={toggleMenu}>
            <i className="fa-solid fa-bars hamburger-icon"></i>
          </div>

          {/* Nav Menu */}
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
              to="/about-us"
              onClick={(e) => {
                e.preventDefault();
                safeNavigate("/about-us"); 
              }}
              className="nav-item"
            >
              About Us
            </Link>
          </div>

          <div className={`auth-menu ${menuOpen ? "active" : ""}`}>
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="icons profile"
                  onClick={(e) => {
                    e.preventDefault();
                    safeNavigate("/profile");
                  }}
                >
                  <i className="fa-solid fa-user" />
                </Link>

                {/* Logout Button */}
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

                {/* Favorites Icon */}
                <Link
                  to="/favorites"
                  className="icons heart"
                  onClick={(e) => {
                    e.preventDefault();
                    safeNavigate("/favorites");
                  }}
                >
                  <i className="fa-solid fa-heart" />
                </Link>

                {/* Cart Icon */}
                <Link
                  to="/cart"
                  className="icons bag"
                  onClick={(e) => {
                    e.preventDefault();
                    safeNavigate("/cart");
                  }}
                >
                  <i className="fa-solid fa-bag-shopping" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
      {loading && <Loading />}
    </>
  );
};

export default Navbar;
