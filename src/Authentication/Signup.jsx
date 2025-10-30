import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthContext from "./AuthContext";
import "./Signup.css";
import MainImage from "../assets/product_homepage.png";

const Signup = () => {
  const navigate = useNavigate();
  const { signup, error: authError, setError: setAuthError } = useAuthContext();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    server: "", // comes from AuthContext
  });
  const [loading, setLoading] = useState(false);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validateField = (name, value) => {
    switch (name) {
      case "firstName":
        return value.trim() ? "" : "First name is required";
      case "lastName":
        return value.trim() ? "" : "Last name is required";
      case "email":
        return emailRegex.test(value) ? "" : "Enter a valid email";
      case "password":
        return value.length >= 6 ? "" : "Password must be at least 6 characters";
      case "confirmPassword":
        return value === password ? "" : "Passwords do not match";
      default:
        return "";
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldError = validateField(name, value);

    // update state
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

    setErrors((prev) => ({
      ...prev,
      [name]: fieldError,
      server: "", // clear server error while typing
    }));
  };

  // ---- Form submit -------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    //  1. Validate everything
    const newErrors = {
      firstName: validateField("firstName", firstName),
      lastName: validateField("lastName", lastName),
      email: validateField("email", email),
      password: validateField("password", password),
      confirmPassword: validateField("confirmPassword", confirmPassword),
      server: "",
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((err) => err !== "");
    if (hasError) return;

    // 2. Call context signup
    setLoading(true);
    setAuthError?.(""); // clear any previous auth error

    try {
      await signup({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        confirmPassword, // not sent to backend – just for UI
      });

      // signup already navigates to "/" on success
    } catch (err) {
      // AuthContext already sets `error` – we just mirror it
      setErrors((prev) => ({ ...prev, server: authError || "Signup failed" }));
    } finally {
      setLoading(false);
    }
  };
  return (
    <section className="signup-section">
      <img className="main_of_image" src={MainImage} alt="Product homepage" />
      <div className="signup-container">
        <h1 className="signup-title">Sign Up</h1>

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          {/* ----- Name row ----- */}
          <div className="name-row">
            <div className="input-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                autoComplete="given-name"
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>

            <div className="input-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                autoComplete="family-name"
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>
          </div>

          {/* ----- Email ----- */}
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              autoComplete="email"
            />
            {errors.email && <span className="field-error">{errors.email}</span>}
          </div>

          {/* ----- Password ----- */}
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="new-password"
            />
            {errors.password && <span className="field-error">{errors.password}</span>}
          </div>

          {/* ----- Confirm Password ----- */}
          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              autoComplete="new-password"
            />
            {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          </div>

          {/* ----- Server / Global error ----- */}
          {(errors.server || authError) && <div className="global-error">{errors.server || authError}</div>}

          {/* ----- Submit ----- */}
          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        <p className="signup-footer">
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Signup;
