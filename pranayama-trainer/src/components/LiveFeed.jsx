import React, { useEffect, useRef, useState } from "react";
import { Pose } from "@mediapipe/pose";
import { Hands } from "@mediapipe/hands";
import * as cam from "@mediapipe/camera_utils";

const WebcamFeed = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [stats, setStats] = useState({
    breathCount: 0,
    breathsLeft: 0,
    breathsRight: 0,
    postureCorrect: true,
    spineOk: false,
    elbowOk: false,
    side: null,
    cycles: 0,
  });

  useEffect(() => {
    if (!videoRef.current) return;

    // Initialize Pose
    const pose = new Pose({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
    });
    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // Initialize Hands
    const hands = new Hands({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
    });
    hands.setOptions({
      maxNumHands: 2,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    // State vars for breath cycle
    let activeSide = null;
    let sideSince = Date.now() / 1000;
    let breathsLeft = 0,
      breathsRight = 0,
      breathCount = 0,
      cycles = 0,
      lastCompletedSide = null;
    const BREATH_MIN_SECONDS = 0.5;

    // Angle helper
    const angleBetween = (a, b, c) => {
      const ab = [a.x - b.x, a.y - b.y];
      const cb = [c.x - b.x, c.y - b.y];
      const dot = ab[0] * cb[0] + ab[1] * cb[1];
      const magAB = Math.hypot(...ab);
      const magCB = Math.hypot(...cb);
      if (magAB === 0 || magCB === 0) return 0;
      let cosv = dot / (magAB * magCB);
      cosv = Math.min(1, Math.max(-1, cosv));
      return (Math.acos(cosv) * 180) / Math.PI;
    };

    const distance = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

    // Core drawing + logic
    const handleResults = (poseRes, handRes) => {
      if (!canvasRef.current || !videoRef.current) return;
      const ctx = canvasRef.current.getContext("2d");

      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.drawImage(videoRef.current, 0, 0, ctx.canvas.width, ctx.canvas.height);

      let spineOk = false,
        elbowOk = false,
        side = null;

      if (poseRes.poseLandmarks) {
        const lm = poseRes.poseLandmarks;
        const leftSh = lm[11],
          rightSh = lm[12],
          leftHip = lm[23],
          rightHip = lm[24],
          rightEl = lm[14],
          rightWr = lm[16];

        // Spine
        const shoulderMid = {
          x: (leftSh.x + rightSh.x) / 2,
          y: (leftSh.y + rightSh.y) / 2,
        };
        const hipMid = {
          x: (leftHip.x + rightHip.x) / 2,
          y: (leftHip.y + rightHip.y) / 2,
        };
        const spineVec = {
          x: hipMid.x - shoulderMid.x,
          y: hipMid.y - shoulderMid.y,
        };
        const spineDev = Math.abs(
          (Math.atan2(spineVec.x, spineVec.y) * 180) / Math.PI
        );
        spineOk = spineDev <= 15.0;

        // Elbow
        const r_angle = angleBetween(rightSh, rightEl, rightWr);
        elbowOk = r_angle >= 60 && r_angle <= 160;

        // Draw skeleton (shoulder→elbow→wrist, hips, etc.)
        const pts = lm.map((p) => ({
          x: p.x * ctx.canvas.width,
          y: p.y * ctx.canvas.height,
        }));

        const drawLine = (a, b, ok) => {
          ctx.beginPath();
          ctx.moveTo(pts[a].x, pts[a].y);
          ctx.lineTo(pts[b].x, pts[b].y);
          ctx.strokeStyle = ok ? "lime" : "red";
          ctx.lineWidth = 3;
          ctx.stroke();
        };

        drawLine(11, 13, elbowOk);
        drawLine(13, 15, elbowOk);
        drawLine(23, 24, spineOk);
        drawLine(11, 23, spineOk);
        drawLine(12, 24, spineOk);

        ctx.fillStyle = "cyan";
        pts.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3, 0, 2 * Math.PI);
          ctx.fill();
        });
      }

      // Hand → nose detection
      if (handRes.multiHandLandmarks && poseRes.poseLandmarks) {
        const nose = poseRes.poseLandmarks[0]; // nose
        let closestDist = Infinity;
        let closestSide = null;

        handRes.multiHandLandmarks.forEach((hand) => {
          const thumb = hand[4];
          const index = hand[8];
          const avg = { x: (thumb.x + index.x) / 2, y: (thumb.y + index.y) / 2 };
          const d = distance(avg, nose);
          if (d < closestDist && d <= 0.09) {
            closestDist = d;
            closestSide = avg.x < nose.x ? "L" : "R";
          }
        });

        side = closestSide;
      }

      // Breath logic
      const now = Date.now() / 1000;
      if (side !== activeSide) {
        if (activeSide && now - sideSince >= BREATH_MIN_SECONDS) {
          if (activeSide === "R") breathsLeft++;
          if (activeSide === "L") breathsRight++;
          breathCount++;

          if (lastCompletedSide === null) {
            lastCompletedSide = activeSide;
          } else {
            if (activeSide !== lastCompletedSide) {
              cycles++;
              lastCompletedSide = null;
            } else {
              lastCompletedSide = activeSide;
            }
          }
        }
        activeSide = side;
        sideSince = now;
      }

      setStats({
        breathCount,
        breathsLeft,
        breathsRight,
        postureCorrect: spineOk && elbowOk,
        spineOk,
        elbowOk,
        side,
        cycles,
      });
    };

    // Sync Pose + Hands results
    let lastPose = null,
      lastHands = null;
    pose.onResults((poseRes) => {
      lastPose = poseRes;
      if (lastHands) handleResults(poseRes, lastHands);
    });
    hands.onResults((handRes) => {
      lastHands = handRes;
      if (lastPose) handleResults(lastPose, handRes);
    });

    // Camera
    const camera = new cam.Camera(videoRef.current, {
      onFrame: async () => {
        await pose.send({ image: videoRef.current });
        await hands.send({ image: videoRef.current });
      },
      width: 640,
      height: 480,
    });
    camera.start();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4 space-y-6">
      <h1 className="text-2xl font-bold">🧘 Real-Time Pranayama</h1>
      <div className="relative w-[640px] h-[480px]">
        <video ref={videoRef} autoPlay muted playsInline className="hidden" />
        <canvas ref={canvasRef} className="absolute top-0 left-0" />
      </div>
      <div className="bg-white shadow-lg rounded-xl p-4 w-[400px]">
        <p>Breaths: {stats.breathCount}</p>
        <p>Breaths Left: {stats.breathsLeft}</p>
        <p>Breaths Right: {stats.breathsRight}</p>
        <p>Cycles: {stats.cycles}</p>
        <p>Posture: {stats.postureCorrect ? "✅ Correct" : "❌ Incorrect"}</p>
        <p>Spine: {stats.spineOk ? "✅ Straight" : "❌ Deviated"}</p>
        <p>Elbow: {stats.elbowOk ? "✅ OK" : "❌ Wrong Angle"}</p>
        <p>Side: {stats.side || "None"}</p>
      </div>
    </div>
  );
};

export default WebcamFeed;
