// App.jsx
import React, { useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomeSection from "./components/HomeSection";
import PracticeSection from "./components/PracticeSection";
import History from "./components/History";


export default function App() {
  const practiceRef = useRef(null);

  const scrollToPractice = () => {
    practiceRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <HomeSection onGetStarted={scrollToPractice} />
              <div ref={practiceRef}>
                <PracticeSection />
              </div>
            </>
          }
        />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
}
