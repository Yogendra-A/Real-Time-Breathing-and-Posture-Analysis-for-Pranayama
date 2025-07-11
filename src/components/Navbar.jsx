// src/components/Navbar.jsx
import React from 'react';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm flex justify-between items-center px-6 py-4 z-50">
      <div className="text-xl font-bold">🫁 Pranayama</div>
      <div className="space-x-4">
        <button className="text-gray-600 hover:text-black">Login</button>
        <button className="text-gray-600 hover:text-black">History</button>
      </div>
    </nav>
  );
}
