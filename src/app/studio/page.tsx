"use client";

import { useRef } from "react";
import LeftNavBar from "@/components/LeftNavBar";
import MainWorkspace from "@/components/MainWorkspace";
import RightPanel from "@/components/RightPanel";
import SettingsModal from "@/components/SettingsModal";
import { useStudioStore } from "@/store/useStudioStore";
import { useResizer } from "@/hooks/useResizer";

export default function StudioPage() {
  const theme = useStudioStore((s) => s.theme);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useResizer(containerRef, resizerRef, rightPanelRef);

  return (
    <div className={`studio-layout ${theme === "light" ? "theme-light" : ""}`}>
      <div className="shrink-0 h-full" style={{ width: "var(--sidebar-width)" }}>
        <LeftNavBar />
      </div>

      <div ref={containerRef} className="flex-1 flex flex-row overflow-hidden w-full h-full">
        <div className="flex-1 relative overflow-hidden bg-black w-0">
          <MainWorkspace />
        </div>

        <div
          ref={resizerRef}
          className="w-1.5 shrink-0 relative group cursor-col-resize transition-colors"
          style={{ background: "var(--color-border)" }}
        >
          <div
            className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-yellow-500/30 transition-colors z-50"
            style={{ transitionDelay: "100ms" }}
          />
        </div>

        <div ref={rightPanelRef} style={{ width: 280 }} className="shrink-0 h-full overflow-hidden flex flex-col bg-surface-2 border-l border-white/5">
          <RightPanel />
        </div>
      </div>

      <SettingsModal />
    </div>
  );
}
