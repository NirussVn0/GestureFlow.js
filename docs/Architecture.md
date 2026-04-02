# Kiến trúc Dự án GestureFlow.js

## Tổng quan (Overview)
GestureFlow.js được thiết kế như một nền tảng thực nghiệm AI trên trình duyệt (sử dụng MediaPipe) đi đôi với Next.js (App Router), Canvas 2D/Three.js và Zustand. 
Định vị chuẩn Senior với các nguyên tắc kiến trúc: **SOLID, Tách rời Logic và UI, Cấu trúc Dữ liệu đơn luồng siêu tốc.**

## 📂 Sơ đồ Thư mục

```text
GestureFlow.js/
├── src/
│   ├── app/
│   │   ├── page.tsx               # Landing page hiện đại (Anime.js Animation)
│   │   ├── studio/page.tsx        # Dashboard Studio Layout chính
│   │   ├── globals.css            # Biến màu sắc, SCSS Modules & Utility
│   │   └── layout.tsx             # Root layout của Next.js App Router
│   ├── components/
│   │   ├── ControlPanel.tsx       # Bảng điều khiển (Camera Toggle, ML Module, FPS Stats)
│   │   ├── MainWorkspace.tsx      # Quản lý Video Live feed và ML Output Canvas Overlay
│   │   └── PIPWindow.tsx          # Cửa sổ ảo đa năng (Clone/Virtual Cam), tích hợp kéo thả
│   ├── hooks/
│   │   └── useDraggable.ts        # Custom Hook: Tối ưu hoá việc kéo thả với Zero-Rerender
│   ├── services/
│   │   ├── CameraService.ts       # Singleton Class: Quản lý vòng đời (Lifecycle) Camera
│   │   └── FaceTrackingService.ts # Singleton Class: WebAssembly Core của MediaPipe & Detection
│   └── store/
│       └── useStudioStore.ts      # Zustand Store: Trạng thái UI Bridge giữa React và Services
├── docs/                          # Hệ thống tài liệu dự án
```

## ⚙️ Các Quyết Định Kiến Trúc Cốt Lõi (Core Principles)

### 1. Singleton Services Layer
- Các luồng xử lý ngoài lề DOM (luồng gọi WebRTC Webcam, gọi thư viện AI WebAssembly) KHÔNG MỚI hoàn toàn bằng React State.
- Sử dụng **Singleton Pattern:** `CameraService` và `FaceTrackingService`. Khởi tạo một đối tượng chuyên biệt duy nhất. Nếu `CameraService` đang chạy, `MainWorkspace` có trượt hay Unmount đi chăng nữa, state dữ liệu và memory không bị leak.

### 2. State Management (Zustand & Bridge)
- **Tập trung hóa Dữ liệu:** Không lạm dụng truyền Props React phức tạp (Prop Drilling). `fps`, trạng thái `cameraActive`, `modelLoaded` v.v đều được đẩy thẳng vào một kho Global (`useStudioStore.ts`). 
- **Tách biệt hiệu ứng:** Tính năng này đảm bảo Component `ControlPanel` khi render hiển thị FPS không bắt component khổng lồ `MainWorkspace` phải re-render lại khung video.

### 3. Hiệu năng "Zero Re-Render" Khung kéo thả (Performance Draggable)
- **Không dùng React State (`useState`)** để bắt thuộc tính `{ x, y }` khi thiết kế cửa sổ PiP.
- Bất kì thư viện bình dân (vd react-rnd) gọi state 60 lần/giây khi rê chuột => Tự sát hiệu năng UI.
- 🛠 Xây dựng bằng `requestAnimationFrame` + `useRef` gốc của Component (*xem `src/hooks/useDraggable.ts`*).
  - Tọa độ ngầm ở `Ref`. 
  - Thay đổi vị trí bằng cách ép phần tử chạy Hardware Acceleration: `DOM.style.transform = translate3d(x,y,0)`. Trải nghiệm mượt bơ, React Component Tree hoàn toàn "không biết" có chuyện gì đang diễn ra!

### 4. Đệm Vẽ Video Xuyên Thấu (Stream Synchronization)
- Không tạo một thẻ Image liên tục thay thẻ SRC để tải webcam. Thay vào đó dùng thẻ `<video>` ẩn (hidden playsInline). 
- Rendering Context rút trích `context.drawImage(video)` từng Frame dựa vào `requestAnimationFrame` và xếp chồng mảng chấm ảo AI (Landmarks) lên lưới Canvas theo chiều lật ngang (Mirroring).
