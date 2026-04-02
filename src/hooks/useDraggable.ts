import { useEffect, useRef, useLayoutEffect } from "react";

const EDGE_MARGIN = 12;

interface DragState {
  active: boolean;
  startMouseX: number;
  startMouseY: number;
  startElX: number;
  startElY: number;
}

export function useDraggable(
  elementRef: React.RefObject<HTMLElement | null>,
  handleRef: React.RefObject<HTMLElement | null>,
  initialPosition?: { right: number; bottom: number }
) {
  const pos = useRef({ x: 0, y: 0 });
  const drag = useRef<DragState>({
    active: false,
    startMouseX: 0,
    startMouseY: 0,
    startElX: 0,
    startElY: 0,
  });
  const initialized = useRef(false);

  useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el || !el.parentElement || initialized.current) return;
    initialized.current = true;

    const parentRect = el.parentElement.getBoundingClientRect();
    const elW = el.offsetWidth;
    const elH = el.offsetHeight;

    const right = initialPosition?.right ?? 20;
    const bottom = initialPosition?.bottom ?? 20;

    pos.current.x = parentRect.width - elW - right;
    pos.current.y = parentRect.height - elH - bottom;

    el.style.transform = `translate3d(${pos.current.x}px, ${pos.current.y}px, 0)`;
  }, [elementRef, initialPosition]);

  useEffect(() => {
    const el = elementRef.current;
    const handle = handleRef.current ?? el;
    if (!el || !handle) return;

    const clampToParent = (rawX: number, rawY: number) => {
      const parent = el.parentElement;
      if (!parent) return { x: rawX, y: rawY };

      const parentW = parent.clientWidth;
      const parentH = parent.clientHeight;
      const elW = el.offsetWidth;
      const elH = el.offsetHeight;

      const minX = EDGE_MARGIN;
      const minY = EDGE_MARGIN;
      const maxX = parentW - elW - EDGE_MARGIN;
      const maxY = parentH - elH - EDGE_MARGIN;

      return {
        x: Math.round(Math.min(Math.max(rawX, minX), maxX)),
        y: Math.round(Math.min(Math.max(rawY, minY), maxY)),
      };
    };

    const onPointerDown = (e: PointerEvent) => {
      e.preventDefault();
      drag.current = {
        active: true,
        startMouseX: e.clientX,
        startMouseY: e.clientY,
        startElX: pos.current.x,
        startElY: pos.current.y,
      };
      el.style.willChange = "transform";
      handle.style.cursor = "grabbing";
      document.body.style.userSelect = "none";
      handle.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.current.active) return;

      const dx = e.clientX - drag.current.startMouseX;
      const dy = e.clientY - drag.current.startMouseY;

      const rawX = drag.current.startElX + dx;
      const rawY = drag.current.startElY + dy;

      const clamped = clampToParent(rawX, rawY);
      pos.current.x = clamped.x;
      pos.current.y = clamped.y;

      el.style.transform = `translate3d(${clamped.x}px, ${clamped.y}px, 0)`;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!drag.current.active) return;
      drag.current.active = false;
      el.style.willChange = "auto";
      handle.style.cursor = "grab";
      document.body.style.userSelect = "";
      handle.releasePointerCapture(e.pointerId);
    };

    handle.addEventListener("pointerdown", onPointerDown);
    handle.addEventListener("pointermove", onPointerMove);
    handle.addEventListener("pointerup", onPointerUp);

    return () => {
      handle.removeEventListener("pointerdown", onPointerDown);
      handle.removeEventListener("pointermove", onPointerMove);
      handle.removeEventListener("pointerup", onPointerUp);
    };
  }, [elementRef, handleRef]);
}
