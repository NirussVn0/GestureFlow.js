"use client";

import { useEffect, useRef, useCallback } from "react";
import { CameraService } from "@/services/CameraService";
import { FaceTrackingService } from "@/services/FaceTrackingService";
import { VirtualCamService } from "@/services/VirtualCamService";
import { useStudioStore } from "@/store/useStudioStore";
import PIPWindow from "@/components/PIPWindow";
import { Camera } from "lucide-react";

const HUD_PADDING = 16;
const HUD_LINE_HEIGHT = 18;
const HUD_FONT = "600 12px 'Inter', monospace";
const INFERENCE_INTERVAL_MS = 33;
const LANDMARK_RADIUS = 1.5;
const TWO_PI = 2 * Math.PI;

export default function MainWorkspace() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement>(null);

  const isCameraActive = useStudioStore((s) => s.isCameraActive);
  const isModelLoaded = useStudioStore((s) => s.isModelLoaded);
  const showStatsOverlay = useStudioStore((s) => s.showStatsOverlay);
  const showPip = useStudioStore((s) => s.showPip);
  const setFps = useStudioStore((s) => s.setFps);
  const setFacesDetected = useStudioStore((s) => s.setFacesDetected);

  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const fpsRef = useRef<number>(0);
  const facesRef = useRef<number>(0);
  const lastInferenceTimeRef = useRef<number>(0);

  const showOverlayRef = useRef(showStatsOverlay);
  const showVirtualCamOverlayRef = useRef(false);
  const faceTrackingEnabledRef = useRef(true);

  useEffect(() => { showOverlayRef.current = showStatsOverlay; }, [showStatsOverlay]);

  useEffect(() => {
    const unsub = useStudioStore.subscribe((state) => {
      showVirtualCamOverlayRef.current = state.showVirtualCamOverlay;
      faceTrackingEnabledRef.current = state.sensors.faceTracking;
    });
    showVirtualCamOverlayRef.current = useStudioStore.getState().showVirtualCamOverlay;
    faceTrackingEnabledRef.current = useStudioStore.getState().sensors.faceTracking;
    return unsub;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const outputCanvas = outputCanvasRef.current;
    if (!video || !outputCanvas) return;

    let isSubscribed = true;

    if (isCameraActive) {
      CameraService.getInstance()
        .initialize(video)
        .then(() => {
          if (isSubscribed) {
            VirtualCamService.getInstance().initialize(outputCanvas);
            useStudioStore.getState().setVideoReady(true);
          }
        })
        .catch(() => {});
    } else {
      CameraService.getInstance().dispose();
      VirtualCamService.getInstance().dispose();
      useStudioStore.getState().setVideoReady(false);
    }

    return () => {
      isSubscribed = false;
      CameraService.getInstance().dispose();
      VirtualCamService.getInstance().dispose();
      useStudioStore.getState().setVideoReady(false);
    };
  }, [isCameraActive]);

  const drawHud = useCallback((
    ctx: CanvasRenderingContext2D,
    h: number,
    fps: number,
    faces: number
  ) => {
    const lines = [`FPS: ${fps}`, `Faces: ${faces}`, isModelLoaded ? "AI: GPU" : "AI: loading"];
    const boxH = HUD_PADDING * 2 + lines.length * HUD_LINE_HEIGHT;
    const boxW = 110;
    const x = HUD_PADDING;
    const y = h - boxH - HUD_PADDING;

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.beginPath();
    ctx.roundRect(x, y, boxW, boxH, 8);
    ctx.fill();

    ctx.font = HUD_FONT;
    ctx.fillStyle = "#F5C518";
    lines.forEach((line, i) => {
      ctx.fillText(line, x + HUD_PADDING, y + HUD_PADDING + HUD_LINE_HEIGHT * i + 12);
    });
    ctx.restore();
  }, [isModelLoaded]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const outputCanvas = outputCanvasRef.current;
    if (!video || !canvas || !outputCanvas) return;

    const ctx = canvas.getContext("2d");
    const outputCtx = outputCanvas.getContext("2d");
    if (!ctx || !outputCtx) return;

    const renderLoop = () => {
      const now = performance.now();
      frameCountRef.current++;

      if (now - lastTimeRef.current >= 1000) {
        fpsRef.current = frameCountRef.current;
        setFps(frameCountRef.current);
        frameCountRef.current = 0;
        lastTimeRef.current = now;
      }

      if (video.readyState >= 2 && video.videoWidth > 0) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          outputCanvas.width = video.videoWidth;
          outputCanvas.height = video.videoHeight;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
        outputCtx.drawImage(canvas, 0, 0);

        if (
          isModelLoaded &&
          faceTrackingEnabledRef.current &&
          now - lastInferenceTimeRef.current > INFERENCE_INTERVAL_MS
        ) {
          lastInferenceTimeRef.current = now;
          const results = FaceTrackingService.getInstance().detectForVideo(video, now);
          if (results && results.faceLandmarks.length > 0) {
            facesRef.current = results.faceLandmarks.length;
            setFacesDetected(results.faceLandmarks.length);

            const drawLandmarks = (target: CanvasRenderingContext2D, w: number, h: number) => {
              target.fillStyle = "#F5C518";
              for (const marks of results.faceLandmarks) {
                for (const pt of marks) {
                  target.beginPath();
                  target.arc((1 - pt.x) * w, pt.y * h, LANDMARK_RADIUS, 0, TWO_PI);
                  target.fill();
                }
              }
            };

            drawLandmarks(ctx, canvas.width, canvas.height);

            if (showVirtualCamOverlayRef.current) {
              drawLandmarks(outputCtx, outputCanvas.width, outputCanvas.height);
            }
          } else {
            facesRef.current = 0;
            setFacesDetected(0);
          }
        }

        if (!faceTrackingEnabledRef.current) {
          facesRef.current = 0;
        }

        if (showOverlayRef.current) {
          drawHud(ctx, canvas.height, fpsRef.current, facesRef.current);
        }

        if (showVirtualCamOverlayRef.current) {
          drawHud(outputCtx, outputCanvas.height, fpsRef.current, facesRef.current);
        }
      }

      requestRef.current = requestAnimationFrame(renderLoop);
    };

    if (isCameraActive) {
      lastTimeRef.current = performance.now();
      requestRef.current = requestAnimationFrame(renderLoop);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      outputCtx.clearRect(0, 0, outputCanvas.width, outputCanvas.height);
      setFacesDetected(0);
      setFps(0);
    }

    return () => cancelAnimationFrame(requestRef.current);
  }, [isCameraActive, isModelLoaded, setFacesDetected, setFps, drawHud]);

  return (
    <div className="relative w-full h-full overflow-hidden" style={{ background: "#000" }}>
      {!isCameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "var(--color-gold-glow)", border: "1px solid var(--color-gold)" }}
          >
            <Camera size={28} style={{ color: "var(--color-gold)" }} />
          </div>
          <div className="text-center">
            <p style={{ color: "var(--color-text-muted)" }} className="text-sm">Camera is offline</p>
            <p className="gold-gradient text-xs font-bold tracking-[0.2em] uppercase mt-1">Awaiting Signal</p>
          </div>
        </div>
      )}

      <video ref={videoRef} playsInline muted className="hidden" />

      <canvas
        id="main-ml-canvas"
        ref={canvasRef}
        className="w-full h-full"
        style={{ objectFit: "cover", display: "block" }}
      />

      <canvas ref={outputCanvasRef} className="hidden" />

      {showPip && <PIPWindow />}
    </div>
  );
}
