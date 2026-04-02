"use client";

import {
  X,
  Eye,
  Sun,
  Moon,
  ScanFace,
  Hand,
  PersonStanding,
  MonitorPlay,
  BarChart3,
} from "lucide-react";
import { useStudioStore } from "@/store/useStudioStore";

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="relative w-10 h-5 rounded-full transition-colors duration-300 shrink-0"
      style={{ background: value ? "var(--color-gold)" : "var(--color-border)" }}
    >
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-sm"
        style={{ left: value ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  );
}

function SettingRow({
  icon: Icon,
  label,
  description,
  value,
  onChange,
}: {
  icon: React.ElementType;
  label: string;
  description?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between py-3 border-b last:border-0"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0"
          style={{ background: value ? "var(--color-gold-glow)" : "rgba(255, 255, 255, 0.05)" }}
        >
          <Icon size={16} style={{ color: value ? "var(--color-gold)" : "var(--color-text-muted)" }} />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-medium block" style={{ color: "var(--color-text)" }}>{label}</span>
          {description && (
            <span className="text-[11px] block mt-0.5" style={{ color: "var(--color-text-muted)" }}>{description}</span>
          )}
        </div>
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <p
      className="text-[10px] font-bold uppercase tracking-widest pt-4 pb-1 px-5"
      style={{ color: "var(--color-text-muted)" }}
    >
      {title}
    </p>
  );
}

export default function SettingsModal() {
  const isSettingsOpen = useStudioStore((s) => s.isSettingsOpen);
  const setSettingsOpen = useStudioStore((s) => s.setSettingsOpen);

  const theme = useStudioStore((s) => s.theme);
  const toggleTheme = useStudioStore((s) => s.toggleTheme);
  const showStatsOverlay = useStudioStore((s) => s.showStatsOverlay);
  const setShowStatsOverlay = useStudioStore((s) => s.setShowStatsOverlay);
  const showPip = useStudioStore((s) => s.showPip);
  const setShowPip = useStudioStore((s) => s.setShowPip);
  const showVirtualCamOverlay = useStudioStore((s) => s.showVirtualCamOverlay);
  const setShowVirtualCamOverlay = useStudioStore((s) => s.setShowVirtualCamOverlay);
  const sensors = useStudioStore((s) => s.sensors);
  const setSensor = useStudioStore((s) => s.setSensor);

  if (!isSettingsOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setSettingsOpen(false)}
      />

      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10"
        style={{ background: "var(--color-surface)" }}
      >
        <div className="flex justify-between items-center p-5 border-b" style={{ borderColor: "var(--color-border)" }}>
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text)" }}>Studio Settings</h2>
          <button
            onClick={() => setSettingsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={18} style={{ color: "var(--color-text)" }} />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          <SectionTitle title="AI Sensors" />
          <div className="px-5">
            <SettingRow
              icon={ScanFace}
              label="Face Tracking"
              description="Detect face landmarks with MediaPipe"
              value={sensors.faceTracking}
              onChange={(v) => setSensor("faceTracking", v)}
            />
            <SettingRow
              icon={Hand}
              label="Hand Tracking"
              description="Detect hand gestures and finger positions"
              value={sensors.handTracking}
              onChange={(v) => setSensor("handTracking", v)}
            />
            <SettingRow
              icon={PersonStanding}
              label="Body Tracking"
              description="Full body pose estimation"
              value={sensors.bodyTracking}
              onChange={(v) => setSensor("bodyTracking", v)}
            />
          </div>

          <SectionTitle title="Display" />
          <div className="px-5">
            <SettingRow
              icon={Eye}
              label="Stats Overlay"
              description="Show FPS and detection info on main canvas"
              value={showStatsOverlay}
              onChange={setShowStatsOverlay}
            />
            <SettingRow
              icon={BarChart3}
              label="Virtual Cam Overlay"
              description="Show stats on virtual cam output"
              value={showVirtualCamOverlay}
              onChange={setShowVirtualCamOverlay}
            />
            <SettingRow
              icon={MonitorPlay}
              label="Virtual Cam PIP"
              description="Show picture-in-picture preview"
              value={showPip}
              onChange={setShowPip}
            />
          </div>

          <SectionTitle title="Appearance" />
          <div className="px-5 pb-2">
            <SettingRow
              icon={theme === "dark" ? Moon : Sun}
              label={theme === "dark" ? "Dark Mode" : "Light Mode"}
              description="Switch studio appearance"
              value={theme === "dark"}
              onChange={() => toggleTheme()}
            />
          </div>
        </div>

        <div
          className="p-3 text-center border-t flex flex-col gap-0.5"
          style={{ borderColor: "var(--color-border)", background: "rgba(0,0,0,0.15)" }}
        >
          <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
            GestureFlow.js v0.2 — All settings auto-saved
          </span>
          <span className="text-[9px] font-semibold gold-gradient">
            Crafted by NirussVn0
          </span>
        </div>
      </div>
    </div>
  );
}
