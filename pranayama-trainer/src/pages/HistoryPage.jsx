// src/pages/HistoryPage.jsx
import React from "react";

function HistoryPage({ onBack }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
      <h2 className="text-2xl font-bold">📜 Practice History</h2>
      <div className="bg-white p-4 rounded shadow w-full max-w-xl">
        <p>🗓️ 20 Sept 2025 - Nadi Shodhana - 10 mins</p>
      </div>
      <div className="bg-white p-4 rounded shadow w-full max-w-xl">
        <p>🗓️ 18 Sept 2025 - Kapalabhati - 8 mins</p>
      </div>
      <button
        onClick={onBack}
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Back to Practice
      </button>
    </div>
  );
}

export default HistoryPage;
