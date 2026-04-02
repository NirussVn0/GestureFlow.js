# GestureFlow.js

<div align="center">

![GestureFlow Banner](https://img.shields.io/badge/GestureFlow.js-v1.0-blueviolet?style=for-the-badge&logo=javascript&logoColor=white)
[![MediaPipe](https://img.shields.io/badge/Powered%20by-MediaPipe-FF6D00?style=for-the-badge&logo=google&logoColor=white)](https://mediapipe.dev/)
[![License](https://img.shields.io/badge/License-AGPL--3.0-green?style=for-the-badge)](LICENSE)

[![GitHub Stars](https://img.shields.io/github/stars/NirussVn0/GestureFlow.js?style=social)](https://github.com/NirussVn0/GestureFlow.js/stargazers)
[![GitHub Forks](https://img.shields.io/github/forks/NirussVn0/GestureFlow.js?style=social)](https://github.com/NirussVn0/GestureFlow.js/network/members)
[![GitHub Repo Size](https://img.shields.io/github/repo-size/NirussVn0/GestureFlow.js)](https://github.com/NirussVn0/GestureFlow.js)

</div>

---

> ✋ **Turn your hands into a paintbrush.** GestureFlow.js is an interactive browser-based particle system powered by MediaPipe hand tracking — no plugins, no installs, just your webcam and pure visual magic.

---

## ✨ Features

- 🖐️ **Real-time hand tracking** via MediaPipe Hands (21 landmarks per hand)
- 🌊 **Fluid particle effects** that follow your finger tips and gestures
- 🎨 **Multiple visual modes** — trails, bursts, attractors and more
- 📷 **Webcam-first** — works entirely in the browser, zero backend
- ⚡ **Lightweight** — vanilla JS + Canvas API, no heavy frameworks
- 📱 **Responsive** — adapts to any screen size

---

## 🎬 Demo

<div align="center">

![Demo GIF](./assets/demo.gif)

🔗 **[Live Demo →](https://visualniruss.xyz/gestureflow)**

</div>

---

## 🛠️ Tech Stack

### Core
- ![JavaScript](https://img.shields.io/badge/JavaScript-ES2022-F7DF1E?style=flat&logo=javascript&logoColor=black) **Vanilla JS** — no framework overhead
- ![MediaPipe](https://img.shields.io/badge/MediaPipe-Hands-FF6D00?style=flat&logo=google&logoColor=white) **MediaPipe Hands** — real-time 3D hand landmark detection
- ![Canvas API](https://img.shields.io/badge/Canvas-HTML5-E34F26?style=flat&logo=html5&logoColor=white) **Canvas 2D API** — GPU-accelerated rendering

### Tooling
- ![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=flat&logo=vite&logoColor=white) **Vite** — blazing fast dev server & bundler
- ![ESLint](https://img.shields.io/badge/ESLint-8.0-4B32C3?style=flat&logo=eslint&logoColor=white) **ESLint** — code linting
- ![Prettier](https://img.shields.io/badge/Prettier-3.0-F7B93E?style=flat&logo=prettier&logoColor=white) **Prettier** — code formatting

---

## 🚀 Getting Started

### Prerequisites
- A browser with **WebGL + WebRTC support** (Chrome/Edge recommended)
- A **webcam**

### Installation

```bash
# Clone the repo
git clone https://github.com/NirussVn0/GestureFlow.js.git
cd GestureFlow.js

# Install dependencies
npm install
# or with pnpm (recommended)
pnpm install

# Start dev server
pnpm dev
```

Then open `http://localhost:5173` and allow webcam access. ✋

---

## 🧠 How It Works

```mermaid
graph TD
    subgraph Input
        A["📷 Webcam Feed"]
    end

    subgraph Processing
        B["🤖 MediaPipe Hands<br/>(Landmark Detection)"]
        C["🧠 Gesture Interpreter<br/>(Pinch / Swipe / Point)"]
    end

    subgraph Rendering
        D["✨ Particle Engine<br/>(Canvas 2D)"]
    end

    subgraph Output
        E["Visual Output"]
    end

    A --> B
    B --> C
    C --> D
    D --> E

    style A fill:#1a1a1a,stroke:#646CFF,stroke-width:2px,color:#fff
    style B fill:#1a1a1a,stroke:#FF6D00,stroke-width:2px,color:#fff
    style C fill:#1a1a1a,stroke:#F7DF1E,stroke-width:2px,color:#fff
    style D fill:#1a1a1a,stroke:#E34F26,stroke-width:2px,color:#fff
    style E fill:#1a1a1a,stroke:#00ffcc,stroke-width:4px,color:#fff
```


MediaPipe detects **21 3D keypoints** per hand at ~30fps. GestureFlow maps these landmarks to particle emitters, attractors, and color modes — so your hands literally paint in realtime.

---

## 🎮 Gestures Supported

| Gesture | Effect |
|---|---|
| ☝️ Index finger point | Emit particle trail |
| 🤏 Pinch (thumb + index) | Create burst explosion |
| ✋ Open palm | Attract all particles |
| ✌️ Peace sign | Switch color palette |
| ✊ Fist | Clear canvas |

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feat/cool-effect`)
3. Commit your changes (`git commit -m 'add: cool particle effect'`)
4. Push to the branch (`git push origin feat/cool-effect`)
5. Open a Pull Request 🚀

---

## 👨‍💻 Author

<div align="center">

**NirussVn0** — Love Tech, AI & Creative Coding ✨

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/NirussVn0)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:work.niruss.dev@gmail.com)
[![Portfolio](https://img.shields.io/badge/Portfolio-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://melatonin-tech.xyz/)

</div>

---

## 📄 License

This project is licensed under the **GNU Affero General Public License v3.0 (AGPL-3.0)**. See the [LICENSE](LICENSE) file for the full text.

---

<div align="center">

**⭐ Star this repo if it sparked joy (or particles)!**

Made with ❤️ by [NirussVn0](https://github.com/NirussVn0) · 2026

</div>