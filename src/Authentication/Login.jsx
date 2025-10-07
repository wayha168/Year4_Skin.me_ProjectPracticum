import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // loading state
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // start loading

    try {
      const response = await axios.post("http://localhost:8080/api/v1/auth/login", {
        email,
        password,
      });

      console.log("Login response:", response.data);

      if (response.data && response.data.success === true) {
        localStorage.setItem("token", response.data.data.token);
        // Simulate small delay to show loading spinner
        setTimeout(() => {
          setLoading(false);
          navigate("/"); 
        }, 500);
      } else {
        setLoading(false);
        setError(response.data.message || "Login failed");
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F3DCD5FF" }}>
      <div className="w-full max-w-xl p-8 rounded-lg shadow-lg" style={{ backgroundColor: "#F4BEAE" }}>
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: "#D4593D" }}>
          Login
        </h1>

        {/* Error message */}
        {error && (
          <p className="mb-4 text-center font-bold" style={{ color: "red" }}>
            {error}
          </p>
        )}

        {/* Login form */}
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block mb-1" style={{ color: "#D4593D" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              placeholder="Enter your email"
              required
              disabled={loading} // disable input while loading
            />
          </div>

          <div>
            <label className="block mb-1" style={{ color: "#D4593D" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              placeholder="Enter your password"
              required
              disabled={loading} // disable input while loading
            />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm" style={{ color: "#D4593D" }}>
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`w-full py-2 mt-2 rounded-lg font-bold ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            style={{ backgroundColor: "#D4593D", color: "#F4BEAE" }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Social login */}
        <div className="my-4 flex items-center justify-center space-x-2">
          <span style={{ color: "#D4593D" }}>or login with</span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            className="w-full py-2 rounded-lg font-bold border border-gray-300"
            style={{ backgroundColor: "#1877F2", color: "#fff" }}
            disabled={loading}
          >
            Login with Facebook
          </button>
          <button
            className="w-full py-2 rounded-lg font-bold border border-gray-300"
            style={{ backgroundColor: "#DB4437", color: "#fff" }}
            disabled={loading}
          >
            Login with Google
          </button>
        </div>

        {/* Signup link */}
        <p className="mt-4 text-center" style={{ color: "#D4593D" }}>
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
