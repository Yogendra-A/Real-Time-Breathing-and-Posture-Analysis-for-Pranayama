// src/components/PracticeLayout.jsx
import React, { useState, useRef } from 'react';
import Webcam from "react-webcam";

export default function PracticeLayout() {
  const webcamRef = useRef(null);
  const [isRunning, setIsRunning] = useState(false);

  const [timer, setTimer] = useState(60); // Default 60 sec
  const [isTimerActive, setIsTimerActive] = useState(false);

  const playEndSound = () => {
    const audio = new Audio("/ding.mp3"); // Place this in public folder
    audio.play();
  };

  // Timer logic
  React.useEffect(() => {
    let interval;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
      playEndSound();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  return (
    <div className="min-h-screen px-6 py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Left side: webcam + timer + buttons */}
        <div className="space-y-4">
          <div className="border-2 border-black rounded-md aspect-video">
            {isRunning ? (
              <Webcam
                ref={webcamRef}
                audio={false}
                className="w-full h-full object-cover rounded-md"
                screenshotFormat="image/jpeg"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Click "Start" to begin session
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="border border-black rounded p-2 text-center text-xl font-semibold">
            ⏱ {Math.floor(timer / 60)
              .toString()
              .padStart(2, '0')}:{(timer % 60).toString().padStart(2, '0')}
          </div>

          {/* Start / Pause / Resume / Stop */}
          <div className="flex gap-4 justify-center">
            {!isRunning ? (
              <button
                onClick={() => {
                  setIsRunning(true);
                  setIsTimerActive(true);
                }}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow"
              >
                Start
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsTimerActive(!isTimerActive)}
                  className="px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md shadow"
                >
                  {isTimerActive ? "Pause" : "Resume"}
                </button>
                <button
                  onClick={() => {
                    setIsRunning(false);
                    setIsTimerActive(false);
                    setTimer(60);
                  }}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow"
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right side: reference video + comments */}
        <div className="space-y-4">
          <div className="border-2 border-black rounded-md aspect-video">
            <iframe
              className="w-full h-full rounded-md"
              src="https://www.youtube.com/embed/your_video_id_here"
              title="Reference Video"
              frameBorder="0"
              allowFullScreen
            />
          </div>
          <div className="border-2 border-black rounded-md p-4 text-gray-700 text-sm">
            💬 Feedback will appear here.
            <ul className="list-disc pl-4 mt-2">
              <li>Breathe in / out</li>
              <li>Correct posture count</li>
              <li>Incorrect posture count</li>
              <li>Guided feedback text</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
