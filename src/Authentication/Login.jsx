// src/Authentication/Login.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import useAuthContext from "./AuthContext";
import Loading from "../Components/Loading/Loading";
import "./Login.css";
import MainImage from "../assets/product_homepage.png";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, error } = useAuthContext();

  const [notification, setNotification] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Show popup for 5s when Login page mounts if redirected from favorites
  useEffect(() => {
    if (location.state?.showLoginPopup) {
      setNotification("Please login to see your favorites");
      const timer = setTimeout(() => setNotification(""), 5000); // 5s
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = await login({ email, password });

    if (userData) {
      if (location.state?.redirectTo) {
        navigate(location.state.redirectTo);
      } else {
        const rolesArray = Array.isArray(userData.roles)
          ? userData.roles
          : [userData.role];
        const isAdmin = rolesArray.includes("ROLE_ADMIN") || rolesArray.includes("ADMIN");
        navigate(isAdmin ? "/dashboard" : "/");
      }
    }

    setIsLoading(false);
  };

  return (
    <section className="login-section">
      {/* Popup notification below navbar */}
      {notification && (
        <div className="the-login-notification">{notification}</div>
      )}

      <img className="main_of_image" src={MainImage} alt="Main visual" />

      {/* Show this message ONLY if redirected from favorites */}
      {/* {location.state?.showLoginPopup && (
        <div className="need-account">
          <p>Please login to see your favorite</p>
        </div>
      )} */}

      <div className="login-container">
        <h1 className="login-title">Login</h1>
        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit} className="login-form">
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              required
              disabled={isLoading}
            />
          </div>

          <div className="forgot-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button
            type="submit"
            className={`login-button ${isLoading ? "disabled" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="divider">Or continue with</div>

        <div className="social-buttons">
          <button className="facebook-btn">
            <FaFacebook /> Facebook
          </button>
          <button className="google-btn">
            <FaGoogle /> Google
          </button>
        </div>

        <p className="signup-text">
          Don't have an account?{" "}
          <Link to="/signup" className="signup-link">
            Sign Up
          </Link>
        </p>
      </div>

      {isLoading && <Loading />}
    </section>
  );
};

export default Login;
