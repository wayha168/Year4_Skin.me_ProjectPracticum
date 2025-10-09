import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CgPhone } from "react-icons/cg";
import { FaFacebook, FaGoogle } from "react-icons/fa";
import useAuthContext from "../Authentication/AuthContext";
import Loading from "../Components/Loading/Loading";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, error } = useAuthContext();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "email") setEmail(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const userData = await login({ email, password });
    setIsLoading(false);

    if (userData) {
      console.log("✅ Logged in user:", userData);

      const isAdmin = userData.roles?.includes("ROLE_ADMIN");

      console.log("👑 Is Admin:", isAdmin);

      if (isAdmin) {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    }
  };

  return (
    <section className="min-h-screen bg-pink-100 flex items-center justify-center">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-center text-pink-400 mb-4">Login</h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              required
              disabled={isLoading}
            />
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-pink-400">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            className={`w-full py-2 mt-2 rounded-lg font-bold text-white ${
              isLoading ? "bg-pink-200 cursor-not-allowed" : "bg-pink-400 hover:bg-pink-500"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {isLoading && <Loading />}

        <div className="my-4 flex items-center justify-center text-sm text-gray-500">Or continue with</div>

        <div className="flex gap-2">
          <button className="flex-1 py-2 rounded-lg bg-blue-600 text-white flex items-center justify-center gap-2">
            <FaFacebook /> Facebook
          </button>
          <button className="flex-1 py-2 rounded-lg bg-red-600 text-white flex items-center justify-center gap-2">
            <FaGoogle /> Google
          </button>
          <button className="flex-1 py-2 rounded-lg bg-gray-600 text-white flex items-center justify-center gap-2">
            <CgPhone /> Phone
          </button>
        </div>

        <p className="mt-4 text-center text-gray-700">
          Don't have an account?{" "}
          <Link to="/signup" className="font-bold text-pink-400 underline">
            Sign Up
          </Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
