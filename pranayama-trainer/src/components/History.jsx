// src/pages/HistoryPage.jsx
import React from "react";

function HistoryPage({ onBack }) {
  // Add a safe handler for the Back button so the button works
  // whether or not the parent provided an onBack prop.
  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }
    if (typeof window !== "undefined" && window.history && window.history.length > 1) {
      window.history.back();
      return;
    }
    // Fallback: navigate to root if no history
    window.location.href = "/";
  };

  return (
    // Force a light background and dark text so content is always readable
    <div className="flex flex-col items-center justify-center text-center min-h-screen bg-white text-gray-900 p-6">
      <h2 className="text-2xl font-bold text-gray-900">📜 Practice History</h2>

      <div className="bg-white p-4 rounded shadow w-full max-w-xl text-gray-900">
        <p className="text-gray-800">🗓️ 20 Sept 2025 - Nadi Shodhana - 10 mins</p>
      </div>

      <div className="bg-white p-4 rounded shadow w-full max-w-xl mt-3 text-gray-900">
        <p className="text-gray-800">🗓️ 18 Sept 2025 - Kapalabhati - 8 mins</p>
      </div>

      <div className="text-center mt-6 bg-white p-4 rounded-lg shadow">
        {/* Timer section background color changed to white */}
        <div className="mb-4 flex justify-center gap-4 items-center">
          <label className="text-sm font-medium text-gray-700">Set Time:</label>
          {/* Existing code for time setting controls */}
        </div>

        <div className="text-3xl font-mono text-gray-900">
          {/* Timer display with ensured text visibility */}
          {String(Math.floor(timer / 60)).padStart(2, "0")}:
          {String(timer % 60).padStart(2, "0")}
        </div>

        <div className="flex justify-center gap-4 mt-4">
          {/* Existing code for timer controls */}
        </div>
      </div>

      <button
        type="button"
        onClick={handleBack}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Practice
      </button>
    </div>
  );
}

export default HistoryPage;
