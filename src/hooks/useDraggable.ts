import { useEffect, useRef } from "react";

export function useDraggable(
  ref: React.RefObject<HTMLElement | null>,
  handleRef?: React.RefObject<HTMLElement | null>
) {
  const isDragging = useRef(false);
  const position = useRef({ x: 0, y: 0 });
  const origin = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    const handleEl = handleRef?.current || el;
    if (!el || !handleEl) return;

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

    const updatePosition = () => {
      if (!isDragging.current || !el) return;
      el.style.transform = `translate3d(${position.current.x}px, ${position.current.y}px, 0)`;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      position.current = {
        x: e.clientX - origin.current.x,
        y: e.clientY - origin.current.y,
      };
      requestAnimationFrame(updatePosition);
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
