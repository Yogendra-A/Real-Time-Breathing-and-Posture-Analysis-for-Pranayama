// components/WebcamFeed.jsx
import React, { useEffect, useRef } from "react";

// Pass down a new prop 'onFeedback' to send data to the parent
export default function WebcamFeed({ isActive, onFeedback }) {
  const webcamRef = useRef(null);
  const socketRef = useRef(null);
  const canvasRef = useRef(null); // Hidden canvas for frame capture
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      // 1. Start webcam
      navigator.mediaDevices
        .getUserMedia({ video: { width: 640, height: 480 }, audio: false })
        .then((stream) => {
          if (webcamRef.current) {
            webcamRef.current.srcObject = stream;
          }

          // 2. Connect to WebSocket server
          socketRef.current = new WebSocket("ws://localhost:8765");

          socketRef.current.onopen = () => {
            console.log("WebSocket connected");
            // 3. Start sending frames
            intervalRef.current = setInterval(sendFrame, 100); // 10 frames/sec
          };

          // 4. Listen for feedback from server
          socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (onFeedback) {
              onFeedback(data); // Send feedback to PracticeSection
            }
          };

          socketRef.current.onclose = () => {
            console.log("WebSocket disconnected");
          };

          socketRef.current.onerror = (error) => {
            console.error("WebSocket error:", error);
          };
        })
        .catch((err) => {
          console.error("Webcam error:", err);
        });
    } else {
      // 5. Cleanup when not active
      clearInterval(intervalRef.current); // Stop sending frames
      
      // Close WebSocket connection
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
      
      // Stop webcam tracks
      if (webcamRef.current && webcamRef.current.srcObject) {
        const tracks = webcamRef.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
        webcamRef.current.srcObject = null;
      }
    }

    // Cleanup function on component unmount
    return () => {
        clearInterval(intervalRef.current);
        if (socketRef.current) {
            socketRef.current.close();
        }
        if (webcamRef.current && webcamRef.current.srcObject) {
            webcamRef.current.srcObject.getTracks().forEach((track) => track.stop());
        }
    };
  }, [isActive, onFeedback]); // Add onFeedback to dependency array

  // Function to capture and send a frame
  const sendFrame = () => {
    if (
      socketRef.current &&
      socketRef.current.readyState === WebSocket.OPEN &&
      webcamRef.current &&
      canvasRef.current
    ) {
      const context = canvasRef.current.getContext("2d");
      // Set canvas dimensions
      canvasRef.current.width = webcamRef.current.videoWidth;
      canvasRef.current.height = webcamRef.current.videoHeight;
      
      // Draw video frame to canvas
      // We flip the canvas horizontally to match the un-mirrored video
      // The user sees a mirror, but we send the "real" image
      context.save();
      context.scale(-1, 1);
      context.drawImage(
        webcamRef.current,
        -canvasRef.current.width, 0,
        canvasRef.current.width, canvasRef.current.height
      );
      context.restore();

      // Get image data as JPEG
      const imageData = canvasRef.current.toDataURL("image/jpeg", 0.7); // 70% quality

      // Send as JSON
      socketRef.current.send(
        JSON.stringify({
          type: "frame",
          image: imageData,
        })
      );
    }
  };

  return (
    <div className="aspect-video border border-gray-300 rounded-lg overflow-hidden bg-black relative">
      <video
        ref={webcamRef}
        autoPlay
        muted
        playsInline
        // Flip the video element so the user sees a mirror image
        className="w-full h-full object-cover transform scale-x-[-1]"
      />
      {/* Hidden canvas element for capturing frames */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
