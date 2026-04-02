# GestureFlow.js — Project Architecture

## Overview

GestureFlow.js is an in-browser AI sandbox built on Next.js 15 (App Router), TypeScript, TailwindCSS v4, Zustand, and Google MediaPipe Tasks Vision. It provides a real-time studio environment for computer vision experimentation — face landmark tracking, gesture recognition, and virtual camera streaming — with zero backend required.

The architecture is designed around three non-negotiable axes:
1. **Zero re-render** on camera/AI frames — all hot paths use `requestAnimationFrame` + DOM refs.
2. **Singleton services** — camera, face tracking, and hardware detection are instantiated once, never recreated.
3. **Strict TypeScript** — no `any`, no `@ts-ignore`, no suppressed errors.

---

## Directory Structure

```text
GestureFlow.js/
├── src/
│   ├── app/
│   │   ├── page.tsx                   # Landing page — Anime.js entrance animations
│   │   ├── studio/
│   │   │   ├── page.tsx               # 3-column studio layout (64px nav + canvas + 280px panel)
│   │   │   └── pip-output/page.tsx    # Standalone PIP receiver via BroadcastChannel
│   │   ├── globals.css                # Design tokens (gold/black theme, light mode class)
│   │   └── layout.tsx                 # Root layout with suppressHydrationWarning
│   ├── components/
│   │   ├── LeftNavBar.tsx             # 64px icon sidebar — Home / Studio / Settings / Help
│   │   ├── MainWorkspace.tsx          # Canvas rendering: video + landmarks + HUD + BroadcastChannel
│   │   ├── PIPWindow.tsx              # Bounded draggable virtual cam window + pop-out button
│   │   └── RightPanel.tsx             # Settings toggles, AI status, hardware info, FPS/face counters
│   ├── hooks/
│   │   └── useDraggable.ts            # rAF-based drag hook with optional bounds clamping
│   ├── services/
│   │   ├── CameraService.ts           # Singleton — MediaStream lifecycle management
│   │   ├── FaceTrackingService.ts     # Singleton — MediaPipe FaceLandmarker, GPU delegate
│   │   └── HardwareService.ts         # Singleton — CPU cores, GPU renderer, device RAM
│   └── store/
│       └── useStudioStore.ts          # Zustand store with persist middleware (theme, overlay prefs)
├── docs/
│   ├── Architecture.md                # This file
│   └── task_phase_1_report.md         # Phase 1 & 2 completion report
```

---

## Core Architectural Decisions

### 1. Singleton Service Pattern

Camera, face tracking, and hardware detection are implemented as static singleton classes. This guarantees:
- A single `MediaStream` instance — no duplicate webcam requests.
- MediaPipe WASM loads once, regardless of component mount/unmount cycles.
- No memory leaks when components re-render or route changes.

```ts
// Usage pattern — same instance everywhere
const service = FaceTrackingService.getInstance();
```

### 2. Zero Re-Render Pipeline (rAF + Canvas)

The entire rendering hot path — video decoding, landmark detection, HUD drawing — runs inside a single `requestAnimationFrame` loop in `MainWorkspace`. React state is updated only once per second (for FPS display). Everything else operates through `useRef` directly on the DOM.

```
rAF loop → ctx.drawImage(video) → MediaPipe.detectForVideo() → ctx.fillText(HUD) → schedule next rAF
```

**Performance rules enforced:**
- `getBoundingClientRect()` only on `mouseenter` / `ResizeObserver` — never per-mousemove.
- No `new` objects inside the rAF loop.
- rAF loop self-cancels via `cancelAnimationFrame(ref.current)` in the `useEffect` cleanup.

### 3. useDraggable Hook — Bounded rAF Drag

The `useDraggable` hook achieves 60fps drag without any React state:
1. `mousedown` → record origin relative to current `position.current`.
2. `mousemove` → compute new raw coordinates, pass to `requestAnimationFrame`.
3. rAF callback → optionally clamp within `boundsRef` element bounds → apply `translate3d(x,y,0)` directly to `el.style.transform`.

The `boundsRef` parameter constrains the dragged element to stay within a given parent container — used by `PIPWindow` to prevent it from leaving the center canvas column.

### 4. BroadcastChannel Virtual Camera Stream

The virtual camera PIP feature uses the browser `BroadcastChannel` API:
- `MainWorkspace` calls `createImageBitmap(canvas)` after each frame and posts the transferable bitmap to `gestureflow-pip-stream`.
- `PIPWindow` listens on the same channel and renders the received bitmap to its own canvas via rAF.
- `pip-output/page.tsx` listens on the same channel — opened via `window.open()` — and renders the stream in a dedicated browser window.

`ImageBitmap` is a transferable object, meaning zero-copy transfer between the rendering context and the receiver. This has negligible CPU overhead.

> **Note:** `BroadcastChannel` is not supported in Safari. The implementation targets Chrome/Edge (the practical deployment target for a WebGL/WebAssembly AI studio).

### 5. Zustand Store with Persist Middleware

The global `useStudioStore` manages UI state only — never service state. Persistent preferences (theme, overlay toggles) are saved to `localStorage` via Zustand `persist` middleware so they survive page refreshes.

```ts
// Partialise — only persist UI preferences, not runtime data
partialize: (state) => ({ theme, showStatsOverlay, showPip })
```

### 6. Theme System

Two themes are supported — `dark` (default) and `light` — using CSS custom properties:

```css
:root { --color-bg: #080808; --color-gold: #F5C518; }
.theme-light { --color-bg: #F5F5F0; }
```

The `theme-light` class is applied to the root `<div>` in `studio/page.tsx` based on the Zustand store value, with no JavaScript style injection — pure CSS variable cascade.

### 7. Hardware Detection

`HardwareService` runs once on panel mount and caches:
- `navigator.hardwareConcurrency` — logical CPU cores
- `navigator.deviceMemory` — RAM estimate (Chrome/Edge only, fallback `"unknown"`)
- WebGL `UNMASKED_RENDERER_WEBGL` extension — actual GPU name

This data is displayed in the right panel Settings and used for adaptive AI delegate selection (GPU vs CPU fallback).

---

## Performance Budget

| Resource | Target | Implementation |
|---|---|---|
| Frame time | < 16ms (60fps) | rAF loop, no React re-renders per frame |
| Main thread | Free for AI | Services run in same thread but MediaPipe internally uses WASM threads |
| Memory | No leaks | Singleton services + explicit `cancelAnimationFrame` + `channel.close()` cleanup |
| Canvas DPR | Capped at 1.5 | `Math.min(devicePixelRatio, 1.5)` on offscreen canvases |
| BroadcastChannel | Zero-copy | `ImageBitmap` transferred (not cloned) |
