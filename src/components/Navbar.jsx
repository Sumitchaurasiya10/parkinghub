import React from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  // Read user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-md py-4 px-6 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-2xl font-bold text-blue-600">
        🚗 ParkingHub
      </Link>

      {/* Links */}
      <div className="space-x-6">
        <Link to="/" className="text-gray-700 hover:text-blue-600">Home</Link>
        <Link to="/parking" className="text-gray-700 hover:text-blue-600">Find Parking</Link>

        {!user ? (
          <>
            <Link to="/login" className="text-gray-700 hover:text-blue-600">
              Login
            </Link>
            <Link
              to="/signup"
              className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <span className="text-gray-700 font-semibold">
              👋 Welcome, {user.name}
            </span>
            <button
              onClick={handleLogout}
              className="text-white bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
