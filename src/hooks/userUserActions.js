import { useState } from "react";
import axios from "../api/axiosConfig";
import useAuthContext from "./AuthContext";

const useUserActions = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const addToCart = async (productId) => {
    if (!user) {
      setMessage("Please log in to add to cart");
      return false;
    }

    try {
      setLoading(true);
      await axios.post(`/cart/add`, { productId }, { withCredentials: true });
      setMessage("Added to your cart");
      return true;
    } catch (err) {
      console.error("Error adding to cart:", err);
      setMessage("Failed to add to cart");
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const addToFavorite = async (productId) => {
    if (!user) {
      setMessage("Please log in to favorite");
      return false;
    }

    try {
      setLoading(true);
      await axios.post(`/favorites/add`, { productId }, { withCredentials: true });
      setMessage("Added to your favorites");
      return true;
    } catch (err) {
      console.error("Error adding to favorites:", err);
      setMessage("Failed to add to favorites");
      return false;
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 2000);
    }
  };

  return { addToCart, addToFavorite, loading, message };
};

export default useUserActions;
