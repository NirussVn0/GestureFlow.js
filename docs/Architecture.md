# GestureFlow.js — Project Architecture

## Overview

GestureFlow.js is an in-browser AI studio built with Next.js 16 (App Router + Turbopack), TypeScript (strict mode), TailwindCSS v4, Zustand, and Google MediaPipe Tasks Vision. It provides a real-time environment for computer vision experimentation — face landmark tracking, hand gesture recognition, body pose estimation, and virtual camera streaming — with zero backend required.

The architecture enforces three non-negotiable principles:

1. **Zero re-render on hot paths** — all camera/AI frames use `requestAnimationFrame` + DOM refs, never `setState`.
2. **Singleton services** via private constructors implementing `IService<T>` — camera, face tracking, virtual cam, and hardware detection are instantiated exactly once.
3. **Strict TypeScript** — no `any`, no `as Type`, no `@ts-ignore`, no dead code, no inline comments.

---

## Directory Structure

```text
GestureFlow.js/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Landing — anime.js v4 entrance animations
│   │   ├── studio/
│   │   │   ├── page.tsx                 # Studio layout (LeftNav + Workspace + RightPanel)
│   │   │   └── pip-output/page.tsx      # Standalone PIP output receiver
│   │   ├── globals.css                  # Design tokens (gold/black, light mode, toggle styles)
│   │   └── layout.tsx                   # Root layout with suppressHydrationWarning
│   ├── components/
│   │   ├── LeftNavBar.tsx               # 64px icon sidebar — navigation icons (lucide-react)
│   │   ├── MainWorkspace.tsx            # Dual-canvas render loop: display + clean output
│   │   ├── PIPWindow.tsx                # Draggable virtual cam preview (PointerEvent-based)
│   │   ├── RightPanel.tsx               # Control Panel — camera toggle, AI stats, sensor toggles, hardware
│   │   └── SettingsModal.tsx            # Settings — sensor config, display prefs, theme
│   ├── hooks/
│   │   ├── useDraggable.ts             # PointerEvent + setPointerCapture drag with parent clamping
│   │   └── useResizer.ts               # PointerEvent-based panel resizer with collapse/expand
│   ├── services/
│   │   ├── IService.ts                 # Generic interface: initialize(config) / dispose()
│   │   ├── CameraService.ts            # Singleton — MediaStream lifecycle
│   │   ├── FaceTrackingService.ts       # Singleton — MediaPipe FaceLandmarker (GPU delegate)
│   │   ├── VirtualCamService.ts         # Singleton — canvas.captureStream(30) output pipeline
│   │   └── HardwareService.ts           # Singleton — CPU, GPU, RAM detection
│   └── store/
│       └── useStudioStore.ts            # Zustand + persist (theme, sensors, overlays)
├── docs/
│   ├── Architecture.md                  # This file
│   └── task_phase_1_report.md           # Phase 1 completion report
```

---

## Core Architectural Decisions

### 1. IService Interface + Private-Constructor Singletons

All services implement `IService<TConfig>`:

```ts
interface IService<T> {
  initialize(config: T): void | Promise<void>;
  dispose(): void;
}
```

Each service uses `private constructor()` + `static getInstance()` to guarantee:
- A single `MediaStream` — no duplicate webcam requests.
- MediaPipe WASM loaded once per session, regardless of component cycles.
- Deterministic cleanup via `dispose()` in `useEffect` return.

### 2. Dual-Canvas Zero Re-Render Pipeline

`MainWorkspace` operates two canvases in a single `requestAnimationFrame` loop:

```
rAF loop:
  1. ctx.drawImage(video) → display canvas (mirrored)
  2. outputCtx.drawImage(displayCanvas) → clean output canvas (before AI overlays)
  3. if (sensors.faceTracking) → FaceLandmarker.detectForVideo() → draw landmarks on display canvas
  4. if (showStatsOverlay) → drawHud() on display canvas
  5. if (showVirtualCamOverlay) → draw landmarks + drawHud() on output canvas
  6. schedule next rAF
```

The output canvas feeds `VirtualCamService` via `canvas.captureStream(30)`. When `showVirtualCamOverlay` is OFF, the virtual cam receives a **clean frame** (no landmarks, no HUD). When ON, it mirrors the full studio view.

**Performance constraints enforced:**
- `useRef` for all coordinates — zero React state in rAF.
- Sensor flags read via `useStudioStore.subscribe()` → `useRef` (no re-renders on toggle).
- `cancelAnimationFrame()` in cleanup — no zombie loops.
- Magic numbers extracted to module-scope constants.

### 3. useDraggable — PointerEvent + setPointerCapture

The `useDraggable` hook achieves jitter-free drag without React state:

1. `pointerdown` → snapshot `{startMouseX/Y, startElX/Y}`, call `setPointerCapture(pointerId)`.
2. `pointermove` → compute `delta = currentMouse - startMouse`, apply `translate3d` to `el.style.transform`.
3. `pointerup` → `releasePointerCapture(pointerId)`.

Initial positioning is computed inside the hook via `useLayoutEffect` using `parentElement.getBoundingClientRect()` — fully SSR-safe (no `window` access during render).

Parent clamping enforces `EDGE_MARGIN = 12px` via `Math.min/max` against `parentElement.clientWidth/Height`.

### 4. useResizer — Collapsible Panel Divider

The `useResizer` hook manages the studio's resizable right panel:

- **Pointer Events with capture** — bulletproof tracking even over canvas/video elements.
- **Collapse threshold (60px)** — dragging past this snaps the panel to `width: 0`.
- **Double-click** separator to toggle collapse/expand.
- **Constraints** — min 200px, max 45% of container (capped at 600px).

### 5. Sensor Flags (Face / Hand / Body)

Three sensor toggles are stored in Zustand as `SensorFlags`:

```ts
interface SensorFlags {
  faceTracking: boolean;   // MediaPipe FaceLandmarker
  handTracking: boolean;   // MediaPipe HandLandmarker (planned)
  bodyTracking: boolean;   // MediaPipe PoseLandmarker (planned)
}
```

Currently, **Face Tracking** is fully implemented with MediaPipe FaceLandmarker (GPU delegate, 468 landmarks, up to 2 faces). Hand and Body tracking services are architecturally planned and will follow the same `IService` pattern.

The sensor toggles are exposed in both:
- **Settings Modal** — full configuration with descriptions
- **Control Panel (RightPanel)** — quick on/off toggles for studio workflow

### 6. VirtualCamService — Clean Output Pipeline

The virtual camera captures from the **output canvas** (not the display canvas):

```
Output Canvas → captureStream(30fps) → MediaStream → PIPWindow <video srcObject>
                                                    → pip-output/page.tsx (pop-out)
```

User can toggle `showVirtualCamOverlay` in Settings to optionally include AI landmarks and HUD stats on the virtual cam output.

### 7. Zustand Store with Persist

Persistent preferences saved to `localStorage`:

```ts
partialize: (state) => ({
  theme,
  showStatsOverlay,
  showPip,
  showVirtualCamOverlay,
  sensors,   // { faceTracking, handTracking, bodyTracking }
})
```

Runtime-only state (fps, facesDetected, hardwareInfo) is never persisted.

### 8. Theme System

Dual theme (dark/light) via CSS custom properties:

```css
:root { --color-bg: #080808; --color-gold: #F5C518; }
.theme-light { --color-bg: #F5F5F0; }
```

Applied via class toggle on root `<div>` — pure CSS cascade, no JS style injection.

---

## Performance Budget

| Resource | Target | Implementation |
|---|---|---|
| Frame time | < 16ms (60fps) | rAF loop, zero React re-renders per frame |
| Drag tracking | 0 dropped frames | PointerEvent + setPointerCapture on handle |
| AI inference | ~30fps throttled | 33ms interval gate in rAF loop |
| Memory | No leaks | Private-constructor singletons + explicit dispose() |
| Virtual Cam | Zero-copy stream | canvas.captureStream(30) — browser-native pipeline |
| Layout resize | Zero React state | DOM-direct width manipulation via useResizer |

---

## Credits

Built by **NirussVn0** — Fullstack Developer & AI Engineer.

Technology Stack: Next.js 16 · TypeScript · TailwindCSS v4 · Zustand · MediaPipe Tasks Vision · anime.js v4 · lucide-react
