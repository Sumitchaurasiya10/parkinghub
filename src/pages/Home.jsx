import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-50">
      <h1 className="text-4xl font-bold text-blue-700 mb-6">ParkingHub</h1>
      <div className="space-x-4">
        <Link to="/login" className="text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700">Login</Link>
        <Link to="/signup" className="text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100">Sign Up</Link>
        <Link to="/parking" className="text-gray-700 hover:text-blue-600">Find Parking</Link>
      </div>
    </div>
  );
};

export default Home;
