// components/ReferenceVideo.jsx
import React from "react";

export default function ReferenceVideo({ pranayama }) {
  const videoSources = {
    Pranayama: "/nadi.mp4",     // place in public folder
    Kapalabhati: "/kapal.mp4", // place in public folder
  };

  const src = videoSources[pranayama];

  return (
    <div className="flex items-center justify-center aspect-video border border-gray-300 rounded-lg overflow-hidden bg-black">
      {src ? (
        <video
          key={pranayama}
          src={src}
          controls
          autoPlay
          muted
          className="w-full h-full object-contain bg-black"
        >
          Sorry, your browser does not support embedded videos.
        </video>
      ) : (
        <div className="text-white text-center w-full">
          Video not available.
        </div>
      )}
    </div>
  );
}