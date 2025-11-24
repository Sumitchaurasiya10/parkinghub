
import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-6 text-center mt-12">
      <p>© {new Date().getFullYear()} ParkingHub.</p>
      <p className="text-sm mt-1">thankyou !</p>
    </footer>
  );
};

export default Footer;

