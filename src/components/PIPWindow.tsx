"use client";

import { useRef, useState, useEffect } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { VirtualCamService } from "@/services/VirtualCamService";
import { X, Maximize2 } from "lucide-react";
import { useDraggable } from "@/hooks/useDraggable";

export default function PIPWindow() {
  const rootRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useDraggable(rootRef, handleRef, { right: 20, bottom: 20 });

  useEffect(() => {
    const unsubscribe = VirtualCamService.getInstance().subscribe((newStream) => {
      setStream(newStream);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handlePopOut = () => {
    window.open(
      "/studio/pip-output",
      "gestureflow-pip",
      "width=560,height=316,toolbar=no,menubar=no,scrollbars=no,resizable=yes"
    );
  };

  const handleClose = () => {
    useStudioStore.getState().setShowPip(false);
  };

  return (
    <div
      ref={rootRef}
      className="absolute top-0 left-0 z-40"
      style={{
        width: 280,
        height: 190,
        borderRadius: 12,
        border: "1px solid var(--color-border)",
        background: "#000",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
        overflow: "hidden",
      }}
    >
      <div className="flex flex-col w-full h-full">
        <div
          ref={handleRef}
          className="flex items-center justify-between px-3 shrink-0"
          style={{
            height: 32,
            background: "var(--color-surface)",
            borderBottom: "1px solid var(--color-border)",
            cursor: "grab",
          }}
        >
          <span className="gold-gradient text-[10px] font-bold tracking-widest uppercase select-none">
            Virtual Cam
          </span>
          <div className="flex gap-2">
            <button
              title="Pop out to new window"
              className="flex items-center justify-center w-5 h-5 rounded hover:bg-white/10 transition-colors"
              style={{ color: "var(--color-text-muted)" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePopOut();
              }}
            >
              <Maximize2 size={11} />
            </button>
            <button
              title="Hide PIP"
              className="flex items-center justify-center w-5 h-5 rounded hover:bg-red-500/20 transition-colors"
              style={{ color: "var(--color-text-muted)" }}
              onPointerDown={(e) => {
                e.stopPropagation();
                handleClose();
              }}
            >
              <X size={11} />
            </button>
          </div>
        </div>

        <div className="flex-1 w-full bg-black relative">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          {!stream && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-white/50">
              No signal
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
