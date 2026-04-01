"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import anime from "animejs";
import { Sparkles } from "lucide-react";

export default function Home() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!titleRef.current) return;

    anime({
      targets: titleRef.current,
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1500,
      easing: "easeOutExpo",
    });
  }, []);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden perspective-1000">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 flex flex-col items-center gap-8 text-center px-4">
        <h1 
          ref={titleRef}
          className="text-6xl md:text-8xl font-black tracking-tighter opacity-0"
        >
          <span className="text-white">Gesture</span>
          <span className="magic-gradient">Flow.js</span>
        </h1>
        
        <p className="text-gray-400 text-lg md:text-xl max-w-lg">
          Harness the power of AI to control the browser with your hands. Pure performance, zero limits.
        </p>

        <button
          onClick={() => router.push("/studio")}
          className="group relative px-8 py-4 bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/10 transition-colors backdrop-blur-md"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-teal-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative flex items-center gap-3 text-white font-medium text-lg">
            <Sparkles className="w-5 h-5 text-teal-400" />
            Enter Studio
          </span>
        </button>
      </div>
    </main>
  );
}
