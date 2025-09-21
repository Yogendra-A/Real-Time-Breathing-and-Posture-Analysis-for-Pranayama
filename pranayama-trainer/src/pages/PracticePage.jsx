// src/pages/PracticePage.jsx
import React, { useState, useRef, useEffect } from "react";

function PracticePage({ onHistory }) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);

  // Start webcam
  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera error:", err);
      }
    };
    startCam();
  }, []);

  // Timer functions
  const startTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
  };

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
  };

  const resumeTimer = () => {
    if (!isRunning) {
      setIsRunning(true);
      intervalRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
  };

  const endTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTime(0);
  };

  const formatTime = (t) => {
    const minutes = String(Math.floor(t / 60)).padStart(2, "0");
    const seconds = String(t % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen space-y-6 w-full max-w-5xl mx-auto">
      {/* Top grid: Webcam + Reference Video Placeholder */}
      <div className="grid grid-cols-2 gap-6 w-full">
        <div className="bg-black rounded-lg h-[400px] flex items-center justify-center text-white">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <div className="bg-gray-300 rounded-lg h-[400px] flex items-center justify-center text-gray-700">
          Reference Video (placeholder)
        </div>
      </div>

      {/* Timer + Controls */}
      <div className="flex space-x-4">
        <button onClick={startTimer} className="px-4 py-2 bg-green-500 text-white rounded">Start</button>
        <button onClick={pauseTimer} className="px-4 py-2 bg-yellow-500 text-white rounded">Pause</button>
        <button onClick={resumeTimer} className="px-4 py-2 bg-blue-500 text-white rounded">Resume</button>
        <button onClick={endTimer} className="px-4 py-2 bg-red-500 text-white rounded">End</button>
      </div>

      {/* Feedback + Counter */}
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl text-center">
        <p className="text-lg font-medium">Timer: {formatTime(time)}</p>
        <p className="mt-2">Breath Counter: 0</p>
        <p className="mt-2 text-gray-600">Posture Feedback: Waiting...</p>
      </div>

      {/* History button */}
      <button
        onClick={onHistory}
        className="mt-6 px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-800"
      >
        View History
      </button>
    </div>
  );
}

export default PracticePage;
