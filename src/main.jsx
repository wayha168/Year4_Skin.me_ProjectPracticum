// src/main.js
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar/Navbar.jsx";
import { AuthProvider } from "./Authentication/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
