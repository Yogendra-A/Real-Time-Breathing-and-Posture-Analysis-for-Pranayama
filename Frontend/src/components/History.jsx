// components/History.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const snapshot = await getDocs(collection(db, "sessions"));
        const data = snapshot.docs.map((doc) => doc.data());
        // Sort newest first
        const sorted = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistory(sorted);
      } catch (err) {
        console.error("Error fetching history:", err);
      }
    };

    fetchHistory();
  }, []);

  return (
    <section className="min-h-screen bg-gray-50 px-6 py-10">
      <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">
        🧾 Session History
      </h2>

      <div className="max-w-2xl mx-auto space-y-4">
        {history.length === 0 ? (
          <p className="text-center text-gray-600">No sessions found.</p>
        ) : (
          history.map((entry, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-300 p-4 rounded shadow-sm"
            >
              <p className="text-lg font-medium">
                🧘 {entry.pranayama} – {entry.duration}s
              </p>
              <p className="text-sm text-gray-500">
                📅 {new Date(entry.date).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
