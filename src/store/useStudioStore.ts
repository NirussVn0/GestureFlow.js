import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HardwareInfo {
  cpuCores: number;
  gpuRenderer: string;
  deviceMemoryGb: number | "unknown";
}

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

  theme: "dark" | "light";
  toggleTheme: () => void;

  showStatsOverlay: boolean;
  setShowStatsOverlay: (show: boolean) => void;

  showPip: boolean;
  setShowPip: (show: boolean) => void;

  hardwareInfo: HardwareInfo | null;
  setHardwareInfo: (info: HardwareInfo) => void;
}

export const useStudioStore = create<StudioState>()(
  persist(
    (set) => ({
      isCameraActive: false,
      setCameraActive: (active) => set({ isCameraActive: active }),

      isVideoReady: false,
      setVideoReady: (ready) => set({ isVideoReady: ready }),

      isModelLoaded: false,
      setModelLoaded: (loaded) => set({ isModelLoaded: loaded }),

      fps: 0,
      setFps: (fps) => set({ fps }),

      facesDetected: 0,
      setFacesDetected: (count) => set({ facesDetected: count }),

      theme: "dark",
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "dark" ? "light" : "dark" })),

      showStatsOverlay: true,
      setShowStatsOverlay: (show) => set({ showStatsOverlay: show }),

      showPip: true,
      setShowPip: (show) => set({ showPip: show }),

      hardwareInfo: null,
      setHardwareInfo: (info) => set({ hardwareInfo: info }),
    }),
    {
      name: "gestureflow-studio-prefs",
      partialize: (state) => ({
        theme: state.theme,
        showStatsOverlay: state.showStatsOverlay,
        showPip: state.showPip,
      }),
    }
  )
);
