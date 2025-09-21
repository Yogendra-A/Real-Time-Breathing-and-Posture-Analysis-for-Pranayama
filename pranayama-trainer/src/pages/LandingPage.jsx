// src/pages/LandingPage.jsx
import React from "react";

function LandingPage({ onStart }) {
  return (
    <div className="flex flex-col items-center justify-center text-center h-screen">
      <h1 className="text-4xl font-bold mb-4 flex items-center">
        🧘 <span className="ml-2">Real-Time Pranayama Trainer</span>
      </h1>
      <p className="text-gray-600 mb-6">Track your breathing and posture in real-time.</p>
      <button
        onClick={onStart}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        Get Started
      </button>
    </div>
  );
}

export default LandingPage;
