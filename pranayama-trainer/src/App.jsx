// src/App.jsx
import React, { useState } from "react";
import LandingPage from "./pages/LandingPage";
import PracticePage from "./pages/PracticePage";
import HistoryPage from "./pages/HistoryPage";

function App() {
  const [page, setPage] = useState("landing");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {page === "landing" && <LandingPage onStart={() => setPage("practice")} />}
      {page === "practice" && <PracticePage onHistory={() => setPage("history")} />}
      {page === "history" && <HistoryPage onBack={() => setPage("practice")} />}
    </div>
  );
}

export default App;
