// components/PracticeSection.jsx
import React, { useEffect, useRef, useState } from "react";
import WebcamFeed from "./WebcamFeed";
import ReferenceVideo from "./ReferenceVideo";
import { db } from "../firebase";
import { collection, addDoc } from "firebase/firestore";
import beepSound from "../assets/beep.mp3";

export default function PracticeSection() {
  const [timer, setTimer] = useState(60);
  const [customTime, setCustomTime] = useState("60");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedPranayama, setSelectedPranayama] = useState("Pranayama");
  const beep = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isRunning && !isPaused && timer > 0) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, isPaused, timer]);

  useEffect(() => {
    if (timer === 0 && isRunning) {
      setIsRunning(false);
      beep.current?.play();
      saveSession();
    }
  }, [timer]);

  const startSession = () => {
    const parsed = parseInt(customTime);
    if (!isNaN(parsed) && parsed > 0) {
      setTimer(parsed);
      setIsRunning(true);
      setIsPaused(false);
    }
  };

  const pauseSession = () => setIsPaused(true);
  const resumeSession = () => setIsPaused(false);
  const endSession = () => {
    setIsRunning(false);
    setTimer(0);
    saveSession();
  };

  const saveSession = async () => {
    try {
      await addDoc(collection(db, "sessions"), {
        pranayama: selectedPranayama,
        duration: parseInt(customTime) - timer,
        date: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Error saving session:", err);
    }
  };

  return (
    <section className="bg-white py-10 px-4 min-h-screen flex items-center justify-center">
      <audio ref={beep} src={beepSound} preload="auto" />

      {/* Centered GRID layout */}
      <div className="flex w-full h-full items-center justify-center">
        <div className="grid grid-cols-1 md:grid-cols-[3fr_1fr] gap-6 max-w-7xl w-full items-center justify-center">
          {/* LEFT - Live Camera Feed */}
          <div className="w-full flex flex-col items-center justify-center">
            <WebcamFeed isActive={isRunning && !isPaused} />

            {/* Timer and Set Time */}
            <div className="text-center mt-6 w-full">
              {!isRunning && (
                <div className="mb-4 flex justify-center gap-4 items-center">
                  <label className="text-sm font-medium">Set Time:</label>
                  <select
                    value={parseInt(customTime / 60)}
                    onChange={(e) => {
                      const min = parseInt(e.target.value);
                      const sec = customTime % 60;
                      setCustomTime(min * 60 + sec);
                    }}
                    className="border rounded px-3 py-1"
                  >
                    {[...Array(11)].map((_, i) => (
                      <option key={i} value={i}>
                        {i} min
                      </option>
                    ))}
                  </select>
                  <select
                    value={customTime % 60}
                    onChange={(e) => {
                      const sec = parseInt(e.target.value);
                      const min = Math.floor(customTime / 60);
                      setCustomTime(min * 60 + sec);
                    }}
                    className="border rounded px-3 py-1"
                  >
                    {[0, 10, 20, 30, 40, 50].map((sec) => (
                      <option key={sec} value={sec}>
                        {sec} sec
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="text-3xl font-mono">
                {String(Math.floor(timer / 60)).padStart(2, "0")}:
                {String(timer % 60).padStart(2, "0")}
              </div>

              {/* Controls - Full Width Centered */}
              <div className="flex justify-center gap-4 mt-6">
                {!isRunning && (
                  <button
                    onClick={startSession}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg shadow"
                  >
                    Start
                  </button>
                )}
                {isRunning && !isPaused && (
                  <button
                    onClick={pauseSession}
                    className="px-6 py-2 bg-yellow-500 text-white rounded-lg shadow"
                  >
                    Pause
                  </button>
                )}
                {isRunning && isPaused && (
                  <button
                    onClick={resumeSession}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow"
                  >
                    Resume
                  </button>
                )}
                {isRunning && (
                  <button
                    onClick={endSession}
                    className="px-6 py-2 bg-red-600 text-white rounded-lg shadow"
                  >
                    End
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT - Options */}
          <div className="space-y-4 flex flex-col items-center justify-center">
            {/* Selected Pranayama */}
            <div className="border border-gray-300 rounded-lg p-3 w-full">
              <p className="font-semibold mb-2">🧘 Select Pranayama</p>
              <div className="flex gap-2">
                {["Pranayama", "Kapalabhati"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedPranayama(type)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      selectedPranayama === type
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Reference Video */}
            <div className="border border-gray-300 rounded-lg overflow-hidden w-full flex items-center justify-center">
              <ReferenceVideo pranayama={selectedPranayama} />
            </div>

            {/* Feedback */}
            <div className="border border-gray-300 rounded-lg p-3 bg-gray-50 w-full">
              <p className="font-semibold mb-2">🧠 Feedback</p>
              <ul className="list-disc pl-4 text-sm text-gray-700 space-y-1">
                <li>🫁 Breathe in / out</li>
                <li>✅ Correct posture count</li>
                <li>⚠️ Incorrect posture count</li>
                <li>💬 Guided feedback</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

