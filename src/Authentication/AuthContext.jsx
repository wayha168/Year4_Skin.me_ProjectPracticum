import { createContext, useEffect, useState, useContext } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    // ✅ Load user from localStorage on mount
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token && !user) {
      fetchUser(token);
    }
  }, []);

  // Fetch user from API
  const fetchUser = async (token) => {
    try {
      const { data } = await axios.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data)); // ✅ persist
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

        Cookies.set("token", token, { expires: 7 });
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData)); // ✅ persist

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
      localStorage.removeItem("user"); // ✅ remove persisted user
      setUser(null);
      navigate("/login");

      if (token) {
        await axios.post("/auth/logout", null, { headers: { Authorization: `Bearer ${token}` } });
      }
    } catch (err) {
      console.error("Logout error:", err);
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, error, login, signup, logout }}>{children}</AuthContext.Provider>
  );
};

export default function useAuthContext() {
  return useContext(AuthContext);
}
