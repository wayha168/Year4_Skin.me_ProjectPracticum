import React from "react";
import { Link } from "react-router-dom";

const HomePage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-pink-100 to-pink-300 text-gray-900">
   
      <div className="text-center px-6">
        <h1 className="text-5xl font-extrabold mb-4 text-pink-700 tracking-tight">
          Welcome to <span className="text-gray-900">Skin.me</span>
        </h1>
        <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto">
          Discover your perfect skincare routine with smart recommendations, personalized insights, and a
          touch of beauty.
        </p>

        {/* Call to Action */}
        <div className="flex gap-4 justify-center">
          <Link
            to="/login"
            className="px-6 py-3 bg-pink-600 text-white rounded-xl font-semibold shadow-md hover:bg-pink-700 transition"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-6 py-3 bg-white border border-pink-500 text-pink-600 rounded-xl font-semibold shadow-md hover:bg-pink-50 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>

      <div className="mt-16 w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-6 px-6">
        <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-pink-600 mb-2">Personalized Care</h3>
          <p className="text-gray-600">Tailored skincare advice based on your skin type and goals.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-pink-600 mb-2">AI Insights</h3>
          <p className="text-gray-600">Smart recommendations powered by advanced skin analysis.</p>
        </div>
        <div className="bg-white rounded-2xl shadow-md p-6 text-center hover:shadow-lg transition">
          <h3 className="text-xl font-bold text-pink-600 mb-2">Track Progress</h3>
          <p className="text-gray-600">Monitor improvements over time and achieve glowing results.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
