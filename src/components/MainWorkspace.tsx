"use client";

import { useEffect, useRef } from "react";
import { CameraService } from "@/services/CameraService";
import { FaceTrackingService } from "@/services/FaceTrackingService";
import { useStudioStore } from "@/store/useStudioStore";

export default function MainWorkspace() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isCameraActive = useStudioStore((state) => state.isCameraActive);
  const isModelLoaded = useStudioStore((state) => state.isModelLoaded);
  const setFps = useStudioStore((state) => state.setFps);
  const setFacesDetected = useStudioStore((state) => state.setFacesDetected);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(typeof performance !== "undefined" ? performance.now() : 0);
  const frameCountRef = useRef<number>(0);

  useEffect(() => {
    const startCamera = async () => {
      if (isCameraActive && videoRef.current) {
        try {
          await CameraService.getInstance().start(videoRef.current);
          useStudioStore.getState().setVideoReady(true);
        } catch {
          // Failure silently caught for pure flow
        }
      } else {
        CameraService.getInstance().stop();
        useStudioStore.getState().setVideoReady(false);
      }
    };
    startCamera();
    
    return () => {
      CameraService.getInstance().stop();
      useStudioStore.getState().setVideoReady(false);
    };
  }, [isCameraActive]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const renderLoop = () => {
      const now = performance.now();
      frameCountRef.current++;
      if (now - lastTimeRef.current >= 1000) {
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      if (video.readyState >= 2) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        if (isModelLoaded) {
          const results = FaceTrackingService.getInstance().detectForVideo(video, now);
          if (results) {
            setFacesDetected(results.faceLandmarks.length);
            ctx.fillStyle = "#00ffcc";
            
            // Draw face landmarks over the flipped video
            for (const marks of results.faceLandmarks) {
              for (const pt of marks) {
                ctx.beginPath();
                // Because video is flipped horizontally, we invert X coordinate drawn
                ctx.arc((1 - pt.x) * canvas.width, pt.y * canvas.height, 1.5, 0, 2 * Math.PI);
                ctx.fill();
              }
            }
          } else {
             setFacesDetected(0);
          }
        }
      }
      
      requestRef.current = requestAnimationFrame(renderLoop);
    };

    if (isCameraActive) {
      requestRef.current = requestAnimationFrame(renderLoop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setFacesDetected(0);
      setFps(0);
    }

    return () => {
      cancelAnimationFrame(requestRef.current);
    };
  }, [isCameraActive, isModelLoaded, setFacesDetected, setFps]);

  return (
    <div className="relative w-full h-full max-w-5xl aspect-video mx-auto bg-black/50 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(100,108,255,0.15)] flex items-center justify-center">
      {!isCameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white/50">
          <p>Camera is offline</p>
          <span className="text-xs mt-2 block magic-gradient font-bold tracking-widest uppercase">Awaiting Signal</span>
        </div>
      )}
      <video
        ref={videoRef}
        playsInline
        muted
        className="hidden" // Hiding the raw video element, we only show its output copied to the Canvas.
      />
      <canvas
        id="main-ml-canvas"
        ref={canvasRef}
        className="w-full h-full object-cover transform"
      />
    </div>
  );
}
