import React from "react";
import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const links = [
    { to: "/owner", label: "🏠 Dashboard" },
    { to: "/owner/add", label: "➕ Add Parking" },
    { to: "/owner/bookings", label: "📋 Bookings" },
    { to: "/owner/analytics", label: "📊 Analytics" },
  ];

  return (
    <div className="bg-white shadow-md w-64 h-full fixed top-0 left-0 flex flex-col py-6">
      <h2 className="text-2xl font-bold text-blue-600 text-center mb-8">ParkingHub</h2>
      <nav className="flex flex-col gap-2 px-4">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`p-3 rounded-lg font-medium hover:bg-blue-100 ${
              location.pathname === link.to ? "bg-blue-600 text-white" : "text-gray-700"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
