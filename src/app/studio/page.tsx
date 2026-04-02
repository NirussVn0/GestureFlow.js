"use client";

import { useRef } from "react";
import LeftNavBar from "@/components/LeftNavBar";
import MainWorkspace from "@/components/MainWorkspace";
import RightPanel from "@/components/RightPanel";
import { useStudioStore } from "@/store/useStudioStore";

export default function StudioPage() {
  const theme = useStudioStore((s) => s.theme);
  const centerRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`studio-layout ${theme === "light" ? "theme-light" : ""}`}>
      <LeftNavBar />

      <div
        ref={centerRef}
        className="relative overflow-hidden"
        style={{ background: "#000" }}
      >
        <MainWorkspace boundsRef={centerRef} />
      </div>

      <RightPanel />
    </div>
  );
}
