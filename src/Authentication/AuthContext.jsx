import { createContext, useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  // Initialize user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = Cookies.get("token");
    return savedUser && savedToken ? { ...JSON.parse(savedUser), token: savedToken } : null;
  });

  const [error, setError] = useState("");

  // On mount, fetch user if token exists
  useEffect(() => {
    const token = Cookies.get("token") || localStorage.getItem("token");
    if (token && !user) {
      fetchUser(token);
    }
  }, []);

  // Fetch user info from backend
  const fetchUser = async (token) => {
    try {
      // Replace with correct backend route
      const response = await axios.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

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
      const response = await axios.post("/auth/login", { email, password });

      if (response.status === 200 && response.data?.data?.jwtToken) {
        const token = response.data.data.jwtToken;
        const userData = response.data.data;

        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));
        Cookies.set("token", userData.token, { expires: 7 });

        setUser({ ...userData, token });
        return userData;
      } else {
        setError(response.data?.message || "Login failed");
        return null;
      }
    } catch (err) {
      console.error("Login error:", err.response || err);
      setError(err.response?.data?.message || "Network error");
      return null;
    }
  };

  const signup = async (data) => {
    try {
      const response = await axios.post("/auth/signup", { ...data, role: "user", is_active: 1 });

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
      const token = Cookies.get("token") || localStorage.getItem("token");
      Cookies.remove("token");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      navigate("/login");

      if (token) {
        await axios.post("/auth/logout", null, { headers: { Authorization: `Bearer ${token}` } });
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
