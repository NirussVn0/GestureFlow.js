import { create } from "zustand";

interface StudioState {
  isCameraActive: boolean;
  setCameraActive: (active: boolean) => void;

  isVideoReady: boolean;
  setVideoReady: (ready: boolean) => void;

  isModelLoaded: boolean;
  setModelLoaded: (loaded: boolean) => void;

  fps: number;
  setFps: (fps: number) => void;

  facesDetected: number;
  setFacesDetected: (count: number) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  isCameraActive: false,
  setCameraActive: (active: boolean) => set({ isCameraActive: active }),

  isVideoReady: false,
  setVideoReady: (ready: boolean) => set({ isVideoReady: ready }),

  isModelLoaded: false,
  setModelLoaded: (loaded: boolean) => set({ isModelLoaded: loaded }),

  fps: 0,
  setFps: (fps: number) => set({ fps }),

  facesDetected: 0,
  setFacesDetected: (count: number) => set({ facesDetected: count }),
}));
