import { useEffect, useRef } from "react";

const COLLAPSE_THRESHOLD = 60;
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH_RATIO = 0.45;
const MAX_WIDTH_CAP = 600;

export function useResizer(
  containerRef: React.RefObject<HTMLElement | null>,
  separatorRef: React.RefObject<HTMLElement | null>,
  rightPanelRef: React.RefObject<HTMLElement | null>
) {
  const dragging = useRef(false);
  const collapsed = useRef(false);
  const lastWidth = useRef(DEFAULT_WIDTH);

  useEffect(() => {
    const container = containerRef.current;
    const separator = separatorRef.current;
    const rightPanel = rightPanelRef.current;

    if (!container || !separator || !rightPanel) return;

    const setWidth = (w: number) => {
      rightPanel.style.width = `${w}px`;
      rightPanel.style.overflow = w < 1 ? "hidden" : "";
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      dragging.current = true;
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      separator.setPointerCapture(e.pointerId);

      const canvas = document.getElementById("main-ml-canvas");
      if (canvas) canvas.style.pointerEvents = "none";
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current) return;

      const rect = container.getBoundingClientRect();
      const rawWidth = rect.right - e.clientX;
      const maxW = Math.min(rect.width * MAX_WIDTH_RATIO, MAX_WIDTH_CAP);

      if (rawWidth < COLLAPSE_THRESHOLD) {
        if (!collapsed.current) {
          collapsed.current = true;
          setWidth(0);
        }
        return;
      }

      collapsed.current = false;
      const clampedWidth = Math.min(Math.max(rawWidth, MIN_WIDTH), maxW);
      lastWidth.current = clampedWidth;
      setWidth(clampedWidth);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      separator.releasePointerCapture(e.pointerId);

      const canvas = document.getElementById("main-ml-canvas");
      if (canvas) canvas.style.pointerEvents = "";
    };

    const onDblClick = () => {
      if (collapsed.current) {
        collapsed.current = false;
        setWidth(lastWidth.current || DEFAULT_WIDTH);
      } else {
        collapsed.current = true;
        setWidth(0);
      }
    };

    separator.addEventListener("pointerdown", onPointerDown);
    separator.addEventListener("pointermove", onPointerMove);
    separator.addEventListener("pointerup", onPointerUp);
    separator.addEventListener("dblclick", onDblClick);

    return () => {
      separator.removeEventListener("pointerdown", onPointerDown);
      separator.removeEventListener("pointermove", onPointerMove);
      separator.removeEventListener("pointerup", onPointerUp);
      separator.removeEventListener("dblclick", onDblClick);
    };
  }, [containerRef, separatorRef, rightPanelRef]);
}
