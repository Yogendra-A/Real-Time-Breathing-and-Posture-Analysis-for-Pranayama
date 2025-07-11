// src/components/PracticeLayout.jsx
import React, { useState, useEffect, useRef } from 'react';

export default function PracticeLayout() {
  const [stream, setStream] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((s) => {
          setStream(s);
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch((err) => console.error("Camera access denied", err));
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
  }, [isRunning]);

  return (
    <div className="min-h-screen px-6 py-8 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left side: live video + timer + controls */}
        <div className="space-y-4">
          <div className="border-2 border-black rounded-md aspect-video">
            {stream ? (
              <video
                ref={videoRef}
                autoPlay
                muted
                className="w-full h-full object-cover rounded-md"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                Live video from camera
              </div>
            )}
          </div>

          {/* Timer */}
          <div className="border border-black rounded p-2 text-center">
            ⏱ Timer (MM:SS) — to be added
          </div>

          {/* Start/Stop */}
          <div className="flex justify-center">
            {!isRunning ? (
              <button
                onClick={() => setIsRunning(true)}
                className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md shadow"
              >
                Start
              </button>
            ) : (
              <button
                onClick={() => setIsRunning(false)}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md shadow"
              >
                Stop
              </button>
            )}
          </div>
        </div>

        {/* Right side: guidance + feedback */}
        <div className="space-y-4">
          <div className="border-2 border-black rounded-md aspect-video flex items-center justify-center text-gray-500">
            📼 Recorded video to guide
          </div>
          <div className="border-2 border-black rounded-md p-4 text-gray-700 text-sm">
            💬 Comments like:
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
