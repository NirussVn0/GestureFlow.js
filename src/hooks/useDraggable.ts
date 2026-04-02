import { useEffect, useRef } from "react";

const SNAP_ZONE = 56;

interface DragBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

function computeBounds(
  el: HTMLElement,
  boundsEl: HTMLElement,
  currentPos: { x: number; y: number }
): DragBounds {
  const boundsRect = boundsEl.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const naturalLeft = elRect.left - currentPos.x;
  const naturalTop = elRect.top - currentPos.y;

  return {
    minX: boundsRect.left - naturalLeft,
    minY: boundsRect.top - naturalTop,
    maxX: boundsRect.right - naturalLeft - elRect.width,
    maxY: boundsRect.bottom - naturalTop - elRect.height,
  };
}

function applySnap(raw: number, min: number, max: number): number {
  const clamped = Math.min(Math.max(raw, min), max);

  if (raw < min + SNAP_ZONE) {
    const t = 1 - Math.max(0, (raw - min) / SNAP_ZONE);
    return clamped - (clamped - min) * t * 0.25;
  }
  if (raw > max - SNAP_ZONE) {
    const t = 1 - Math.max(0, (max - raw) / SNAP_ZONE);
    return clamped + (max - clamped) * t * 0.25;
  }
  return clamped;
}

export function useDraggable(
  ref: React.RefObject<HTMLElement | null>,
  handleRef?: React.RefObject<HTMLElement | null>,
  boundsRef?: React.RefObject<HTMLElement | null>
) {
  const isDragging = useRef(false);
  const position = useRef({ x: 0, y: 0 });
  const origin = useRef({ x: 0, y: 0 });
  const bounds = useRef<DragBounds | null>(null);
  const boundsRefInternal = useRef(boundsRef);

  useEffect(() => {
    boundsRefInternal.current = boundsRef;
  });

  useEffect(() => {
    const el = ref.current;
    const handleEl = handleRef?.current ?? el;
    if (!el || !handleEl) return;

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      origin.current = {
        x: e.clientX - position.current.x,
        y: e.clientY - position.current.y,
      };

      const boundsEl = boundsRefInternal.current?.current;
      bounds.current = boundsEl
        ? computeBounds(el, boundsEl, position.current)
        : null;

      el.style.willChange = "transform";
      document.body.style.userSelect = "none";
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      bounds.current = null;
      el.style.willChange = "auto";
      document.body.style.userSelect = "";
    };

    const updatePosition = (rawX: number, rawY: number) => {
      if (!el) return;

      let x = rawX;
      let y = rawY;

      if (bounds.current) {
        const { minX, minY, maxX, maxY } = bounds.current;
        x = applySnap(rawX, minX, maxX);
        y = applySnap(rawY, minY, maxY);
      }

      position.current = { x, y };
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const rawX = e.clientX - origin.current.x;
      const rawY = e.clientY - origin.current.y;
      requestAnimationFrame(() => updatePosition(rawX, rawY));
    };

    handleEl.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      handleEl.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [ref, handleRef]);
}
