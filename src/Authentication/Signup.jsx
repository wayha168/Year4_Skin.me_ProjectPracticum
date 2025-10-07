import React, { useState } from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F4BEAE" }}>
      <div className="w-full max-w-md p-8 rounded-lg shadow-lg" style={{ backgroundColor: "#F4BEAE" }}>
        <h1 className="text-3xl font-bold mb-6 text-center" style={{ color: "#D4593D" }}>
          Sign Up
        </h1>

        <form className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block mb-1" style={{ color: "#D4593D" }}>
                First Name
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                placeholder="First Name"
              />
            </div>
            <div className="flex-1">
              <label className="block mb-1" style={{ color: "#D4593D" }}>
                Last Name
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1" style={{ color: "#D4593D" }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              placeholder="Email"
            />
          </div>

          <div>
            <label className="block mb-1" style={{ color: "#D4593D" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              placeholder="Password"
            />
          </div>

          <div>
            <label className="block mb-1" style={{ color: "#D4593D" }}>
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none"
              placeholder="Confirm Password"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 mt-4 rounded-lg font-bold"
            style={{ backgroundColor: "#D4593D", color: "#F4BEAE" }}
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center" style={{ color: "#D4593D" }}>
          Already have an account?{" "}
          <Link to="/login" className="font-bold underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
