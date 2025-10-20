// src/Authentication/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CgPhone } from "react-icons/cg";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import useAuthContext from "../Authentication/AuthContext";
import Loading from "../Components/Loading/Loading";
import "./Login.css"; // ✅ Link the CSS file
import MainImage from "../assets/product_homepage.png";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // show spinner immediately

    const userData = await login({ email, password });

    if (userData) {
      const rolesArray = Array.isArray(userData.roles) ? userData.roles : [userData.role];
      const isAdmin = rolesArray.includes("ROLE_ADMIN") || rolesArray.includes("ADMIN");
      navigate(isAdmin ? "/dashboard" : "/");
    }

    setIsLoading(false); // hide spinner after everything done
    console.log("Login attempt finished.", userData);
  };

  return (
    <section className="login-section">
      <img className="main_of_image" src={MainImage} alt="Main visual" />
      
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

      {/* ✅ Full-page loading overlay */}
      {isLoading && <Loading />}
    </section>
  );
};

export default Login;
