import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthContext from "./AuthContext";
import Loading from "../Components/Loading/Loading";
import "./Signup.css";
import MainImage from "../assets/product_homepage.png";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup, error } = useAuthContext();

  const popupMessage = location.state?.popupMessage || "";
  const redirectTo = location.state?.redirectTo || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    switch (name) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    
    if (!firstName.trim() || !lastName.trim()) {
      setFormError("Please fill in your first and last name.");
      return;
    }
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setFormError("Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const userData = await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
      });

      if (userData) {
        const rolesArray = Array.isArray(userData.roles) ? userData.roles : [userData.role];
        const isAdmin = rolesArray.includes("ROLE_ADMIN") || rolesArray.includes("ADMIN");
        navigate(redirectTo || (isAdmin ? "/dashboard" : "/"));
      }
    } catch (err) {
      console.error("Signup failed:", err);
      setFormError(error || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="signup-section">
      {popupMessage && <div className="the-login-notification">{popupMessage}</div>}

      <img className="main_of_image" src={MainImage} alt="Main visual" />

      <div className="signup-container">
        <h1 className="signup-title">Sign Up</h1>
        {(formError || error) && <p className="error-message">{formError || error}</p>}

        <form onSubmit={handleSubmit} className="signup-form">
          <div className="name-row">
            <div>
              <label>First Name</label>
              <input
                type="text"
                name="firstName"
                value={firstName}
                onChange={handleInputChange}
                placeholder="First Name"
                required
                disabled={isLoading}
              />
            </div>

            <div>
              <label>Last Name</label>
              <input
                type="text"
                name="lastName"
                value={lastName}
                onChange={handleInputChange}
                placeholder="Last Name"
                required
                disabled={isLoading}
              />
            </div>
          </div>

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

          <div>
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className={`signup-button ${isLoading ? "disabled" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="signup-text">
          Already have an account?{" "}
          <Link to="/login" className="signup-link">
            Login
          </Link>
        </p>
      </div>

      {isLoading && <Loading />}
    </section>
  );
};

export default Signup;
