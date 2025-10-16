import axios from "axios";

const instance = axios.create({
  baseURL: "https://backend.skinme.store/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// Add JWT automatically to every request
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

export default instance;
