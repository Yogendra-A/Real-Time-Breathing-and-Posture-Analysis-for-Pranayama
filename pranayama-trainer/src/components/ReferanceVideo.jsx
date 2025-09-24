// (Delete this file. Use ReferenceVideo.jsx instead.)
import React from "react";

export default function ReferenceVideo({ pranayama }) {
  const videoSources = {
    Pranayama: "/nadi.mp4",     // place in public folder
    Kapalabhati: "/kapal.mp4", // place in public folder
  };

  return (
    <div className="aspect-video border border-gray-300 rounded-lg overflow-hidden">
      <video
        src={videoSources[pranayama]}
        controls
        autoPlay
        muted
        className="w-full h-full object-cover"
      />
    </div>
  );
}
