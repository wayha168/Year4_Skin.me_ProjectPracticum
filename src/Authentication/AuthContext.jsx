import { createContext, useContext, useEffect, useState } from "react";
import axios from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = Cookies.get("token");
        if (token) {
          const { data } = await axios.get("/user", {
            headers: { Authorization: `Bearer ${token}` },
          });

          setUser(data);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error checking authentication:", err);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const getUser = async () => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("No token available");

      const { data } = await axios.get("/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(data);
    } catch (err) {
      handleAuthError(err);
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
        if (userData?.email) Cookies.set("email", userData.email, { expires: 7 });

        setUser(userData);
        console.log("✅ Login successful:", userData);

        return userData; // ✅ return the actual user
      } else {
        setError(response.data?.message || "Login failed. Please try again.");
        return null;
      }
    } catch (err) {
      console.error("Login error details:", err.response || err);
      handleAuthError(err);
      return null;
    }
  };

  const signup = async (data) => {
    try {
      const formData = { ...data, role: "user", is_active: 1 };
      const response = await axios.post("/auth/signup", formData);

      if (response.status === 200 && response.data?.data?.jwtToken) {
        const token = response.data.data.jwtToken;
        Cookies.set("token", token, { expires: 7 });
        await getUser();
        navigate("/");
      } else {
        setError("Unexpected error occurred during signup.");
      }
    } catch (err) {
      handleAuthError(err);
    }
  };

  const logout = async () => {
    try {
      const token = Cookies.get("token");
      Cookies.remove("token");
      Cookies.remove("email");
      setUser(null);

      if (token) {
        await axios.post("/logout", null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      navigate("/login");
    } catch (err) {
      handleAuthError(err);
    }
  };

  const handleAuthError = (err) => {
    if (err.response) {
      if (err.response.status === 422) {
        setError(err.response.data.error);
      } else {
        setError("An error occurred. Please try again later.");
      }
    } else {
      setError("Network error. Please try again later.");
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, error, getUser, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default function useAuthContext() {
  return useContext(AuthContext);
}
