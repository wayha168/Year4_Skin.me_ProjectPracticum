import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthContext from "../../Authentication/AuthContext";
import Loading from "../Loading/Loading";
import "./Navbar.css";

const Navbar = ({ alwaysVisible = false }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthContext();

  // const [isMobile, setIsMobile] = useState(window.innerWidth <= 1030);

  const [prevScrollPos, setPrevScrollPos] = useState(window.scrollY);
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const navRef = useRef(null);
  
//   useEffect(() => {
//   const handleResize = () => setIsMobile(window.innerWidth <= 1030);
//   window.addEventListener("resize", handleResize);
//   return () => window.removeEventListener("resize", handleResize);
// }, []);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 1030);

    useEffect(() => {
      const handleResize = () => setIsMobile(window.innerWidth <= 1030);
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  useEffect(() => {
    if (alwaysVisible) return;
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      setPrevScrollPos(currentScrollPos);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos, alwaysVisible]);

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
    setLoading(true);
    navigate(path);
    setMenuOpen(false);
    setTimeout(() => setLoading(false), 500);
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
              safeNavigate("/");
            }}
          >
            <span className="brand-name">SKIN.ME</span>
            <span className="brand-tagline">@Home Of Your Care</span>
          </Link>

          {/* Hamburger menu */}
          <div className="main-dropdown" onClick={toggleMenu}>
            <i className="fa-solid fa-bars"></i>
          </div>

          {/* Navigation */}
          <div className={`nav-menu ${menuOpen ? "active" : ""}`}>
            <Link to="/" onClick={() => safeNavigate("/")} className="nav-item home">
              Home
            </Link>
            <Link to="/products" onClick={() => safeNavigate("/products")} className="nav-item product">
              Products
            </Link>
            <Link to="/about-us" onClick={() => safeNavigate("/about-us")} className="nav-item about_us">
              About Us
            </Link>
          </div>

          {/* Auth Menu */}
          <div className={`auth-menu ${menuOpen ? "active" : ""}`}>
            <Link
              to="/favorites"
              onClick={() => safeNavigate("/favorites")}
              className="icons nav-icon favorite"
            >
              <i className="fa-solid fa-heart" />
            </Link>
            <Link to="/bag_page" onClick={() => safeNavigate("/bag_page")} className="icons nav-icon">
              <i className="fa-solid fa-bag-shopping" />
            </Link>
            {user && (
              <>
                <Link to="/profile" onClick={() => safeNavigate("/profile")} className="icons nav-icon">
                  <i className="fa-solid fa-user" />
                </Link>
                <button onClick={handleLogout} className="auth_button logout_button">
                  Logout
                </button>
              </>
            )}
            {!user && (
          <>
            {/* Login button logic */}
            {(!isMobile || (isMobile && menuOpen)) && (
              <Link to="/login" onClick={() => safeNavigate("/login")} className="auth-button login-button">
                Login
              </Link>
            )}
            
            <Link to="/signup" onClick={() => safeNavigate("/signup")} className="auth-button signup-button">
              Sign Up
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
