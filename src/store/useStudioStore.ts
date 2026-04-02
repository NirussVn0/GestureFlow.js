import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface HardwareInfo {
  cpuCores: number;
  gpuRenderer: string;
  deviceMemoryGb: number | "unknown";
}

interface SensorFlags {
  faceTracking: boolean;
  handTracking: boolean;
  bodyTracking: boolean;
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

  showVirtualCamOverlay: boolean;
  setShowVirtualCamOverlay: (show: boolean) => void;

  sensors: SensorFlags;
  setSensor: (key: keyof SensorFlags, value: boolean) => void;

  hardwareInfo: HardwareInfo | null;
  isSettingsOpen: boolean;
  setHardwareInfo: (info: HardwareInfo) => void;
  setSettingsOpen: (isOpen: boolean) => void;
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

      showVirtualCamOverlay: false,
      setShowVirtualCamOverlay: (show) => set({ showVirtualCamOverlay: show }),

      sensors: {
        faceTracking: true,
        handTracking: false,
        bodyTracking: false,
      },
      setSensor: (key, value) =>
        set((state) => ({
          sensors: { ...state.sensors, [key]: value },
        })),

      hardwareInfo: null,
      isSettingsOpen: false,
      setHardwareInfo: (info) => set({ hardwareInfo: info }),
      setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),
    }),
    {
      name: "gestureflow-studio-prefs",
      partialize: (state) => ({
        theme: state.theme,
        showStatsOverlay: state.showStatsOverlay,
        showPip: state.showPip,
        showVirtualCamOverlay: state.showVirtualCamOverlay,
        sensors: state.sensors,
      }),
    }
  )
);
