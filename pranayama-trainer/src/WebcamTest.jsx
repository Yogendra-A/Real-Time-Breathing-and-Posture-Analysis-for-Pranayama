import React, { useEffect, useRef } from "react";

const WebcamTest = () => {
  const videoRef = useRef(null);

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Webcam error:", err);
      }
    };

    startWebcam();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-black">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        width="640"
        height="480"
        className="rounded-lg border border-gray-300"
      />
    </div>
  );
};

export default WebcamTest;
