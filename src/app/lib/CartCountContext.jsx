"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import axiosAuth from "./api/axiosConfig";
import useAuthContext from "./Authentication/AuthContext";

const CartCountContext = createContext({
  cartCount: 0,
  refreshCartCount: async () => 0,
  setCartCount: () => {},
  incrementCartCount: () => {},
});

export function getCartItemCount(items) {
  if (!Array.isArray(items) || items.length === 0) return 0;
  return items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
}

export function CartCountProvider({ children }) {
  const { user } = useAuthContext();
  const [cartCount, setCartCount] = useState(0);

  const refreshCartCount = useCallback(async () => {
    if (!user?.id && !user?.token) {
      setCartCount(0);
      return 0;
    }

    try {
      const res = await axiosAuth.get("/carts/my-cart", { withCredentials: true });
      const data = res.data?.data;
      const items = Array.isArray(data?.items) ? data.items : Array.from(data?.items || []);
      const count = getCartItemCount(items);
      setCartCount(count);
      return count;
    } catch (err) {
      if (err?.response?.status === 404 || err?.response?.status === 401) {
        setCartCount(0);
        return 0;
      }
      return null;
    }
  }, [user]);

  const incrementCartCount = useCallback((by = 1) => {
    setCartCount((prev) => Math.max(0, prev + Number(by || 1)));
  }, []);

  useEffect(() => {
    if (!user?.id && !user?.token) {
      setCartCount(0);
      return;
    }
    refreshCartCount();
  }, [user?.id, user?.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({
      cartCount,
      refreshCartCount,
      setCartCount,
      incrementCartCount,
    }),
    [cartCount, refreshCartCount, incrementCartCount],
  );

  return <CartCountContext.Provider value={value}>{children}</CartCountContext.Provider>;
}

export function useCartCount() {
  return useContext(CartCountContext);
}

export default CartCountContext;
