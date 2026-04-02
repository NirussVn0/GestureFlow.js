import { useEffect, useRef } from "react";

export function useDraggable(
  ref: React.RefObject<HTMLElement | null>,
  handleRef?: React.RefObject<HTMLElement | null>,
  boundsRef?: React.RefObject<HTMLElement | null>
) {
  const isDragging = useRef(false);
  const position = useRef({ x: 0, y: 0 });
  const origin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    const handleEl = handleRef?.current ?? el;
    if (!el || !handleEl) return;

    const clamp = (value: number, min: number, max: number) =>
      Math.min(Math.max(value, min), max);

    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      origin.current = {
        x: e.clientX - position.current.x,
        y: e.clientY - position.current.y,
      };
      el.style.willChange = "transform";
      document.body.style.userSelect = "none";
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      el.style.willChange = "auto";
      document.body.style.userSelect = "";
    };

    const updatePosition = (rawX: number, rawY: number) => {
      if (!el) return;

      let x = rawX;
      let y = rawY;

      if (boundsRef?.current) {
        const boundsRect = boundsRef.current.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const minX = boundsRect.left - elRect.left + position.current.x;
        const minY = boundsRect.top - elRect.top + position.current.y;
        const maxX = minX + boundsRect.width - elRect.width;
        const maxY = minY + boundsRect.height - elRect.height;
        x = clamp(rawX, minX, maxX);
        y = clamp(rawY, minY, maxY);
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
  }, [ref, handleRef, boundsRef]);
}
