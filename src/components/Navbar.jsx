// components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";
import LoginDropdown from "./LoginDropdown";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold text-blue-700">
        🫁 Pranayama Trainer
      </Link>
      <div className="flex gap-4 items-center">
        <LoginDropdown />
        <Link
          to="/history"
          className="text-gray-600 hover:text-black transition"
        >
          History
        </Link>
      </div>
    </nav>
  );
}
