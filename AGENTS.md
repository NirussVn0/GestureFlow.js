<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# GestureFlow.js strict OOP & SOLID Rules

**ZERO TOLERANCE FOR SPAGHETTI CODE.** Every change must adhere to strict OOP and SOLID principles. 

## 1. Single Responsibility Principle (SRP)
- **UI Components** (`components/`): Responsible ONLY for rendering DOM, hooking into stores, and listening to user events. They MUST NOT contain complex business logic, message routing, or direct low-level API management.
- **Services** (`services/`): Pure TypeScript classes implementing `IService`. They encapsulate hardware access (Camera, GPU, WebRTC, BroadcastChannel). 
- **Store** (`store/`): Zustand handles only application state/UI preferences. Do not store complex instances (streams, models) in Zustand.

## 2. Dependency Inversion Principle (DIP) & Open-Closed Principle (OCP)
- Components should only depend on high-level abstractions (Hooks & Service Methods).
- E.g., `MainWorkspace` does not create `BroadcastChannel`. It simply calls `VirtualCamService.getInstance().broadcastFrame(canvas)`. The internal routing mechanism (ImageBitmap, WebRTC, captureStream) is hidden and isolated.

## 3. Strict Impacts Validation
Before adding code, verify:
- Does this logic belong here? (If it's handling data streams -> Service. If it's pure UI -> Component).
- Does this break the `requestAnimationFrame` zero-react-state mandate in hot paths?
- Is there any memory leak? (`BroadcastChannel.close()`, `cancelAnimationFrame()`, `dispose()` must be thorough).
- Does this pollute other files? (Use narrow, typed arguments).

**Failure to abide by these rules will compromise the Next.js 15 + Turbopack architecture.** Always analyze side-effects across the `/services` and `/components` tree before modifying.
