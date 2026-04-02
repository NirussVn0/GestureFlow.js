# Task Report — Phase 1 & 2
**Project:** GestureFlow.js
**Status:** Phase 2 Complete ✅

---

## Phase 1: Foundation (Completed)

### Infrastructure
- Initialized Next.js 15 (App Router) with TypeScript, TailwindCSS v4, Zustand, MediaPipe Tasks Vision, Three.js, Anime.js, Lucide React.
- Configured strict ESLint (no `any`, no `console.log`, no `@ts-ignore`) and strict tsconfig (`noUnusedLocals`, `noImplicitReturns`).

### Services
- **`CameraService`** — Singleton managing `navigator.mediaDevices.getUserMedia` lifecycle. Prevents duplicate stream requests.
- **`FaceTrackingService`** — Singleton loading MediaPipe `FaceLandmarker` with GPU delegate. Exposes `detectForVideo()` for per-frame inference.
- **`useStudioStore`** — Zustand store bridging service state to UI (FPS, face count, model loaded status, camera active).

### UI
- **Landing page** with Anime.js entrance animations (v4 `animate()` API).
- **`useDraggable` hook** — Zero re-render drag via `requestAnimationFrame` + direct DOM `transform` mutation.

### Commits
- `feat: Bootstrap project with strict TS/ESLint config`
- `feat: Implement CameraService and FaceTrackingService singletons`
- `feat: Implement magical landing page and custom rAF Draggable Hook`
- `feat: Implement Studio Dashboard, MediaPipe integration and PIP Virtual Cam stream`
- `docs: Add project architecture and phase 1 task report`

---

## Phase 2: Studio UI Overhaul (Completed)

### Design System
- Full gold/black design theme with CSS custom properties (`--color-gold: #F5C518`).
- Light mode via `.theme-light` CSS class overriding all tokens — no JS style injection.
- TailwindCSS v4 directive fixed (`@import "tailwindcss"`).
- Typography: Inter font stack, `gold-gradient` utility class.

### New Components
| Component | Responsibility |
|---|---|
| `LeftNavBar.tsx` | 64px fixed icon sidebar. Active state on current route. Tooltip via `title`. |
| `RightPanel.tsx` | Settings toggles (camera, overlay, PIP, theme), live AI status, hardware info display. |
| `MainWorkspace.tsx` | Canvas renders video mirror + face landmarks (gold dots) + HUD overlay. Streams frames via `BroadcastChannel`. |
| `PIPWindow.tsx` | Bounded draggable virtual cam window constrained to center column. Pop-out via `window.open()`. |
| `pip-output/page.tsx` | Standalone window receiving `ImageBitmap` frames from `BroadcastChannel`. |

### New Services
- **`HardwareService`** — Singleton detecting CPU cores, device RAM, and GPU renderer via WebGL extension. Cached after first call.

### Store Expansions
New slices in `useStudioStore`:
- `theme: 'dark' | 'light'` — persisted to `localStorage`.
- `showStatsOverlay: boolean` — toggles HUD on canvas.
- `showPip: boolean` — shows/hides PIP window.
- `hardwareInfo: HardwareInfo | null` — populated by `HardwareService` on panel mount.
- Zustand `persist` middleware enabled with `partialize` to save only UI prefs.

### Console Hygiene
- Extended `console.warn` + `console.info` interceptor in `FaceTrackingService` to suppress all MediaPipe WASM logs: `gl_context.cc`, `face_landmarker_graph.cc`, `XNNPACK`, `TensorFlow Lite`.

### Performance Decisions
- `ImageBitmap` transfer (zero-copy) for BroadcastChannel PIP streaming.
- `useDraggable` enhanced with `boundsRef` parameter — PIP window clamped inside center column using `getBoundingClientRect()` on `mouseenter` only.
- rAF loop self-terminates on `useEffect` cleanup via `cancelAnimationFrame`.

### Commits
- `fix: Restore Tailwind CSS v4 directive`
- `feat: Intercept and mute MediaPipe WebGL warnings for pure console hygiene`
- `fix: Update AnimeJS v4 syntax and subtitle reference`
- `fix: Resolve React hydration mismatch and animejs default export`
- `feat: Phase 2 — Studio 3-column layout, gold theme, hardware detection, bounded PIP, BroadcastChannel stream`

---

## Known Constraints

- **BroadcastChannel** not supported in Safari — Chrome/Edge only. Acceptable for an AI/WebGL studio.
- **`navigator.deviceMemory`** only available in Chrome/Edge — falls back to `"unknown"` on Firefox.
- **MediaPipe GPU delegate** may fall back to CPU xnnpack on some mobile GPUs — this is handled internally by the MediaPipe runtime.
