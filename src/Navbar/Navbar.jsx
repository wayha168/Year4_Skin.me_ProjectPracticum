import React from "react";
import { Link } from "react-router-dom";
// import logo from "../assets/logo_skin.me.png";

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link to="/" className="flex flex-col items-start">
            <span className="font-extrabold text-3xl text-[#D4593D] tracking-wide">SKIN.ME</span>
            <span className="text-xs text-gray-400 mt-1">@Home Of Your Care</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex space-x-6">
            <Link to="/" className="text-gray-700 hover:text-pink-600 font-medium transition">
              Home
            </Link>
            <Link to="/products" className="text-gray-700 hover:text-pink-600 font-medium transition">
              Products
            </Link>
            <Link to="/about" className="text-gray-700 hover:text-pink-600 font-medium transition">
              About
            </Link>
            <Link to="/contact" className="text-gray-700 hover:text-pink-600 font-medium transition">
              Contact
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex space-x-4">
            <Link
              to="/login"
              className="px-4 py-2 text-pink-600 border border-pink-600 rounded-lg hover:bg-pink-50 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button className="text-gray-700 hover:text-pink-600 focus:outline-none">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
