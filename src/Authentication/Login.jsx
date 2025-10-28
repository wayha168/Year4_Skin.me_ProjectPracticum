import { useState } from "react";
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

  const popupMessage = location.state?.popupMessage || "";
  const redirectTo = location.state?.redirectTo || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = await login({ email, password });
    console.log("Login attempt:", { email, password, userData });
    if (userData) {
      const rolesArray = Array.isArray(userData.roles)
        ? userData.roles
        : [userData.role];
      const isAdmin = rolesArray.includes("ROLE_ADMIN") || rolesArray.includes("ADMIN");
      navigate(redirectTo || (isAdmin ? "/dashboard" : "/"));
    }

    setIsLoading(false);
  };

  return (
    <section className="login-section">
      {popupMessage && (
        <div className="the-login-notification">{popupMessage}</div>
      )}

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

      {isLoading && <Loading />}
    </section>
  );
};

export default Login;
