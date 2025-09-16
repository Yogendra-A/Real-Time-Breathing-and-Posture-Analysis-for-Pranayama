// components/HomeSection.jsx
import React from "react";

export default function HomeSection({ onGetStarted }) {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-white text-center px-6">
      <h1 className="text-4xl md:text-6xl font-extrabold text-blue-800 mb-4">
        Breathe Better. Live Better.
      </h1>
      <p className="text-gray-700 text-lg md:text-xl mb-8 max-w-2xl">
        Welcome to your personal Pranayama Trainer — track, improve, and master your breath with guided video, live feedback, and session history.
      </p>
      <button
        onClick={onGetStarted}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg transition"
      >
        Get Started
      </button>
    </section>
  );
}
