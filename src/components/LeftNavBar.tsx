"use client";

import { Home, Clapperboard, Settings, HelpCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useStudioStore } from "@/store/useStudioStore";

const NAV_ITEMS = [
  { icon: Home, label: "Home", path: "/" },
  { icon: Clapperboard, label: "Studio", path: "/studio" },
  { icon: Settings, label: "Settings", path: "/studio#settings" },
  { icon: HelpCircle, label: "Help", path: "#" },
] as const;

export default function LeftNavBar() {
  const pathname = usePathname();
  const setSettingsOpen = useStudioStore((s) => s.setSettingsOpen);
  const router = useRouter();

  return (
    <nav
      className="flex flex-col items-center py-4 gap-2 border-r"
      style={{
        background: "var(--color-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      <div className="mb-4 flex items-center justify-center w-10 h-10">
        <span className="text-xl font-black gold-gradient select-none">G</span>
      </div>

      <div className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => {
          const isActive = path === "/studio" && pathname === "/studio";
          return (
            <button
              key={label}
              onClick={() => {
                if (label === "Settings") {
                  setSettingsOpen(true);
                } else {
                  router.push(path);
                }
              }}
              title={label}
              className={`nav-icon-btn ${isActive ? "active" : ""}`}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </nav>
  );
}
