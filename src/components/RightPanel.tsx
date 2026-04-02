"use client";

import { useEffect, useState } from "react";
import {
  Camera,
  Cpu,
  Monitor,
  Activity,
} from "lucide-react";
import { useStudioStore } from "@/store/useStudioStore";
import { FaceTrackingService } from "@/services/FaceTrackingService";
import { HardwareService } from "@/services/HardwareService";

function StatRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 border-b" style={{ borderColor: "var(--color-border)" }}>
      <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <span className="text-xs font-mono font-semibold" style={{ color: "var(--color-text)" }}>{value}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 px-4 py-3 border-b" style={{ borderColor: "var(--color-border)" }}>
      <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>{title}</p>
      {children}
    </div>
  );
}

export default function RightPanel() {
  const isCameraActive = useStudioStore((s) => s.isCameraActive);
  const setCameraActive = useStudioStore((s) => s.setCameraActive);
  const isModelLoaded = useStudioStore((s) => s.isModelLoaded);
  const setModelLoaded = useStudioStore((s) => s.setModelLoaded);
  const fps = useStudioStore((s) => s.fps);
  const facesDetected = useStudioStore((s) => s.facesDetected);
  const hardwareInfo = useStudioStore((s) => s.hardwareInfo);
  const setHardwareInfo = useStudioStore((s) => s.setHardwareInfo);

  const [screenResolution, setScreenResolution] = useState("—");

  useEffect(() => {
    setScreenResolution(`${window.screen.width}×${window.screen.height}`);
  }, []);

  useEffect(() => {
    const info = HardwareService.getInstance().detect();
    setHardwareInfo(info);
  }, [setHardwareInfo]);

  useEffect(() => {
    const initModel = async () => {
      if (isModelLoaded) return;
      try {
        await FaceTrackingService.getInstance().initialize({
          delegate: "GPU",
          runningMode: "VIDEO",
          numFaces: 2,
        });
        setModelLoaded(true);
      } catch {
        setModelLoaded(false);
      }
    };
    initModel();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const gpuShort = hardwareInfo?.gpuRenderer
    ? hardwareInfo.gpuRenderer.replace("ANGLE (", "").replace(")", "").slice(0, 28)
    : "Detecting…";

  return (
    <div
      className="flex flex-col h-full overflow-y-auto border-l shrink-0 w-full"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="px-4 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
        <h2 className="text-sm font-bold" style={{ color: "var(--color-text)" }}>Control Panel</h2>
        <p className="text-[10px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>GestureFlow Studio v0.2</p>
      </div>

      <Section title="Camera">
        <button
          onClick={() => setCameraActive(!isCameraActive)}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold transition-all"
          style={{
            background: isCameraActive ? "rgba(239,68,68,0.15)" : "var(--color-gold-glow)",
            border: `1px solid ${isCameraActive ? "rgba(239,68,68,0.4)" : "var(--color-gold)"}`,
            color: isCameraActive ? "#ef4444" : "var(--color-gold)",
          }}
        >
          <Camera size={16} />
          {isCameraActive ? "Stop Camera" : "Start Camera"}
        </button>
      </Section>

      <Section title="AI Core">
        <div className="flex items-center gap-2">
          <Activity
            size={14}
            className={!isModelLoaded ? "loading-pulse" : ""}
            style={{ color: isModelLoaded ? "var(--color-gold)" : "var(--color-text-muted)" }}
          />
          <span className="text-xs" style={{ color: isModelLoaded ? "var(--color-gold)" : "var(--color-text-muted)" }}>
            {isModelLoaded ? "Face Landmarker — GPU" : "Loading model…"}
          </span>
        </div>
        <StatRow label="FPS" value={fps} />
        <StatRow label="Faces Detected" value={facesDetected} />
      </Section>



      <Section title="Hardware">
        <div className="flex flex-col gap-0.5">
          <StatRow label="CPU Cores" value={hardwareInfo?.cpuCores ?? "—"} />
          <StatRow
            label="RAM"
            value={
              hardwareInfo?.deviceMemoryGb === "unknown"
                ? "Not reported"
                : hardwareInfo
                ? `${hardwareInfo.deviceMemoryGb} GB`
                : "—"
            }
          />
          <div className="flex flex-col py-2 gap-0.5">
            <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>GPU Renderer</span>
            <span className="text-[11px] font-mono leading-tight" style={{ color: "var(--color-text)" }}>{gpuShort}</span>
          </div>
        </div>
      </Section>

      <div className="flex-1" />

      <div className="px-4 py-3 border-t" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center gap-1.5">
          <Monitor size={12} style={{ color: "var(--color-text-muted)" }} />
          <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }} suppressHydrationWarning>
            {screenResolution}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          <Cpu size={12} style={{ color: "var(--color-text-muted)" }} />
          <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            {hardwareInfo ? `${hardwareInfo.cpuCores} logical cores` : "Detecting…"}
          </span>
        </div>
      </div>
    </div>
  );
}
