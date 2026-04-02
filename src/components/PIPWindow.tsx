"use client";

import { useEffect, useRef, useState } from "react";
import { useDraggable } from "@/hooks/useDraggable";
import { X, Maximize2 } from "lucide-react";
import { useStudioStore } from "@/store/useStudioStore";

export default function PIPWindow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRef = useRef<HTMLDivElement>(null);
  const pipCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  
  const isVideoReady = useStudioStore((state) => state.isVideoReady);
  const requestRef = useRef<number>(0);

  // High-performance draggable logic attached to Refs without React states
  useDraggable(containerRef, handleRef);

  useEffect(() => {
    const mainCanvas = document.getElementById("main-ml-canvas") as HTMLCanvasElement;
    const pipCanvas = pipCanvasRef.current;

    if (!mainCanvas || !pipCanvas || !isVisible || !isVideoReady) return;

    const ctx = pipCanvas.getContext("2d");
    if (!ctx) return;

    const cloneLoop = () => {
      if (mainCanvas.width && mainCanvas.height) {
        pipCanvas.width = mainCanvas.width;
        pipCanvas.height = mainCanvas.height;
        ctx.clearRect(0, 0, pipCanvas.width, pipCanvas.height);
        ctx.drawImage(mainCanvas, 0, 0, pipCanvas.width, pipCanvas.height);
      }
      requestRef.current = requestAnimationFrame(cloneLoop);
    };

    requestRef.current = requestAnimationFrame(cloneLoop);

    return () => cancelAnimationFrame(requestRef.current);
  }, [isVisible, isVideoReady]);

  if (!isVisible) return null;

  return (
    <div 
      ref={containerRef}
      className="absolute top-8 right-8 w-[320px] aspect-video bg-black/80 rounded-xl border border-white/20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col z-50 backdrop-blur-xl"
    >
      <div 
        ref={handleRef}
        className="w-full h-8 bg-white/5 border-b border-white/10 flex items-center justify-between px-3 cursor-move hover:bg-white/10 transition-colors"
      >
        <span className="text-[10px] uppercase font-bold tracking-wider magic-gradient">Virtual Cam Feed</span>
        <div className="flex gap-2">
          <button className="text-gray-500 hover:text-white transition-colors">
            <Maximize2 className="w-3 h-3" />
          </button>
          <button onClick={() => setIsVisible(false)} className="text-gray-500 hover:text-red-400 transition-colors">
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="flex-1 bg-black/50 overflow-hidden relative">
        <canvas ref={pipCanvasRef} className="w-full h-full object-cover" />
      </div>
    </div>
  );
}
