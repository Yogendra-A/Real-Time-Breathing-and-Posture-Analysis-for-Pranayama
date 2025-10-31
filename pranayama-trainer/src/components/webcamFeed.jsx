// components/WebcamFeed.jsx
import React, { useEffect, useRef } from "react";

export default function WebcamFeed({ isActive }) {
  const webcamRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (webcamRef.current) {
            webcamRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Webcam error:", err);
        });
    } else {
      if (webcamRef.current && webcamRef.current.srcObject) {
        const tracks = webcamRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        webcamRef.current.srcObject = null;
      }
    }
  }, [isActive]);

  return (
    <div
      className="aspect-video border border-gray-300 rounded-lg overflow-hidden bg-black"
      style={{ minHeight: "400px", minWidth: "700px" }}
    >
      <video
        ref={webcamRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
        style={{ minHeight: "400px", minWidth: "700px" }}
      />
    </div>
  );
}
