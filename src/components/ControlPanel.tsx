"use client";

import { useEffect } from "react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaceTrackingService } from "@/services/FaceTrackingService";
import { Camera, View } from "lucide-react";

export default function ControlPanel() {
  const isCameraActive = useStudioStore((state) => state.isCameraActive);
  const setCameraActive = useStudioStore((state) => state.setCameraActive);
  const isModelLoaded = useStudioStore((state) => state.isModelLoaded);
  const setModelLoaded = useStudioStore((state) => state.setModelLoaded);
  const fps = useStudioStore((state) => state.fps);
  const facesDetected = useStudioStore((state) => state.facesDetected);

  useEffect(() => {
    const initModel = async () => {
      try {
        await FaceTrackingService.getInstance().initialize({
          delegate: "GPU",
          runningMode: "VIDEO",
          numFaces: 1,
        });
        setModelLoaded(true);
      } catch {
        // Init error ignored silently contextually
      }
    };
    initModel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex bg-white/5 border border-white/10 rounded-2xl p-4 gap-4 items-center backdrop-blur-md z-20">
      <div className="flex gap-2 mr-auto">
        <button
          onClick={() => setCameraActive(!isCameraActive)}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
            isCameraActive 
              ? "bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30" 
              : "bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30"
          }`}
        >
          <Camera className="w-5 h-5" />
          {isCameraActive ? "Stop Camera" : "Start Camera"}
        </button>
      </div>

      <div className="flex gap-6 items-center text-sm font-medium">
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase text-xs">AI Core</span>
          <span className={isModelLoaded ? "text-teal-400" : "text-yellow-500 animate-pulse"}>
            {isModelLoaded ? "Online (GPU)" : "Loading..."}
          </span>
        </div>
        
        <div className="h-8 w-px bg-white/10" />
        
        <div className="flex flex-col">
          <span className="text-gray-400 uppercase text-xs">Faces Detected</span>
          <span className="text-white flex items-center gap-1">
            <View className="w-4 h-4 text-indigo-400" />
            {facesDetected}
          </span>
        </div>

        <div className="h-8 w-px bg-white/10" />

        <div className="flex flex-col">
          <span className="text-gray-400 uppercase text-xs">FPS Tracker</span>
          <span className={`text-white min-w-[30px] ${fps < 30 && fps > 0 ? "text-red-400" : ""}`}>
            {fps}
          </span>
        </div>
      </div>
    </div>
  );
}
