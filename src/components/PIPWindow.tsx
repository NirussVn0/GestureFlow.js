"use client";

import { useEffect, useRef, useCallback } from "react";
import { useDraggable } from "@/hooks/useDraggable";
import { useStudioStore } from "@/store/useStudioStore";
import { X, Maximize2 } from "lucide-react";

const PIP_WIDTH = 280;
const PIP_HEIGHT = 158;
const PIP_MARGIN = 16;

interface PIPWindowProps {
  channelName: string;
  boundsRef?: React.RefObject<HTMLElement | null>;
}

export default function PIPWindow({ channelName, boundsRef }: PIPWindowProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);

  useDraggable(containerRef, handleRef, boundsRef);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const channel = new BroadcastChannel(channelName);

    channel.onmessage = (e: MessageEvent<{ bitmap: ImageBitmap }>) => {
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        const bmp = e.data.bitmap;
        canvas.width = bmp.width;
        canvas.height = bmp.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bmp, 0, 0);
        bmp.close();
      });
    };

    return () => {
      channel.close();
      cancelAnimationFrame(requestRef.current);
    };
  }, [channelName]);

  const handlePopOut = useCallback(() => {
    window.open(
      "/studio/pip-output",
      "gestureflow-pip",
      `width=${PIP_WIDTH * 2},height=${PIP_HEIGHT * 2},toolbar=no,menubar=no,scrollbars=no,resizable=yes`
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="pip-handle absolute bottom-0 right-0"
      style={{
        width: PIP_WIDTH,
        height: PIP_HEIGHT + 32,
        marginBottom: PIP_MARGIN,
        marginRight: PIP_MARGIN,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid var(--color-border)",
        background: "#000",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        willChange: "transform",
        zIndex: 40,
      }}
    >
      <div
        ref={handleRef}
        className="pip-handle flex items-center justify-between px-3"
        style={{
          height: 32,
          background: "var(--color-surface)",
          borderBottom: "1px solid var(--color-border)",
          cursor: "grab",
        }}
      >
        <span
          className="gold-gradient text-[10px] font-bold tracking-widest uppercase select-none"
        >
          Virtual Cam
        </span>
        <div className="flex gap-1.5">
          <button
            onClick={handlePopOut}
            title="Pop out to new window"
            style={{ color: "var(--color-text-muted)" }}
            className="hover:text-white transition-colors"
          >
            <Maximize2 size={12} />
          </button>
          <button
            onClick={() => useStudioStore.getState().setShowPip(false)}
            title="Hide PIP"
            style={{ color: "var(--color-text-muted)" }}
            className="hover:text-red-400 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: PIP_HEIGHT, display: "block", objectFit: "cover" }}
      />
    </div>
  );
}
