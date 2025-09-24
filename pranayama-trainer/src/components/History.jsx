// src/pages/HistoryPage.jsx
import React from "react";

function HistoryPage({ onBack }) {
  const handleBack = () => {
    if (typeof onBack === "function") {
      onBack();
    } else {
      // fallback: reload or navigate to practice section
      window.location.href = "/";
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center min-h-screen">
      <h2 className="text-2xl font-bold">📜 Practice History</h2>
      <div className="bg-white p-4 rounded shadow w-full max-w-xl">
        <p>🗓️ 20 Sept 2025 - Nadi Shodhana - 10 mins</p>
      </div>
      <div className="bg-white p-4 rounded shadow w-full max-w-xl">
        <p>🗓️ 18 Sept 2025 - Kapalabhati - 8 mins</p>
      </div>
      <button
        onClick={handleBack}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Practice
      </button>
    </div>
  );
}

export default HistoryPage;
