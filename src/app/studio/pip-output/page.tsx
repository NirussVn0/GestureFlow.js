"use client";

import { useEffect, useRef } from "react";

const CHANNEL_NAME = "gestureflow-pip-stream";

export default function PipOutputPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (e: MessageEvent<{ bitmap: ImageBitmap }>) => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const bmp = e.data.bitmap;
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        ctx.drawImage(bmp, 0, 0, canvas.width, canvas.height);
        bmp.close();
      });
    };

    return () => {
      channel.close();
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <main
      style={{
        width: "100vw",
        height: "100vh",
        background: "#000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </main>
  );
}
