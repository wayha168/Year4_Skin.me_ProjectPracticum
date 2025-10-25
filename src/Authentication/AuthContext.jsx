import Cookies from "js-cookie";
import { createContext, useEffect, useState, useContext } from "react";
import axiosAuth from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = Cookies.get("token");
    return savedUser && savedToken ? { ...JSON.parse(savedUser), token: savedToken } : null;
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const token = Cookies.get("token");
    if (token && !user) {
      fetchUser(token);
    }
  }, []);

  const fetchUser = async (token) => {
    try {
      const response = await axiosAuth.get("/users/me"); // <-- use axiosAuth
      if (response.status === 200) {
        const userData = response.data.data;
        setUser({ ...userData, token });
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
      }
    } catch (err) {
      console.error("Failed to fetch user:", err);
      logout();
    }
  };

  const login = async ({ email, password }) => {
    try {
      setError("");
      const response = await axiosAuth.post("/auth/login", { email, password });

      if (response.status === 200 && response.data?.data?.jwtToken) {
        // success
        const token = response.data.data.jwtToken;
        const userData = response.data.data;
        Cookies.set("token", token, { expires: 7 });
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", token);
        setUser({ ...userData, token });
        return userData;
      } else {
        let message = response.data?.message || "Login failed";
        if (message === "Invalid email or password") {
          message = "Incorrect email or password";
        }
        setError(message);
        return null;
      }
    } catch (err) {
      console.error("Login error:", err.response || err);

      let message = err.response?.data?.message || "Network error";
      if (message === "Invalid email or password") {
        message = "Incorrect email or password";
      }

      setError(message);
      return null;
    }
  };

  const signup = async (data) => {
    try {
      const response = await axiosAuth.post("/auth/signup", { ...data, role: "user", is_active: 1 });

      if (response.status === 200 && response.data?.data?.jwtToken) {
        const token = response.data.data.jwtToken;
        Cookies.set("token", token, { expires: 7 });
        localStorage.setItem("token", token);
        await fetchUser(token);
        navigate("/");
      } else {
        setError(response.data?.message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err.response || err);
      setError("Network error");
    }
  };

  const logout = async () => {
    try {
      const token = Cookies.get("token");
      Cookies.remove("token");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");

      if (token) {
        await axiosAuth.post("/auth/logout"); // token automatically added by axiosAuth
        await axiosAuth.post("/auth/logout");
      }
    } catch (err) {
      console.error("Logout error:", err);
      setUser(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, error, login, signup, logout }}>{children}</AuthContext.Provider>
  );
};

export default function useAuthContext() {
  return useContext(AuthContext);
}
