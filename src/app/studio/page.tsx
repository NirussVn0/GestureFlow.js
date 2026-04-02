import ControlPanel from "@/components/ControlPanel";
import MainWorkspace from "@/components/MainWorkspace";
import PIPWindow from "@/components/PIPWindow";

export default function StudioPage() {
  return (
    <main className="relative min-h-screen bg-[#030303] flex flex-col p-6 overflow-hidden">
      <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-teal-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute -bottom-[300px] -left-[300px] w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto w-full flex-1 flex flex-col gap-6">
        <header className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight">Studio</h1>
            <p className="text-gray-500 text-sm mt-1">AI-Powered Gesture & Face Sandbox</p>
          </div>
        </header>
        
        <ControlPanel />
        
        <div className="flex-1 flex items-center justify-center p-4 bg-white/[0.02] border border-white/5 rounded-3xl relative">
          <MainWorkspace />
        </div>
      </div>

      <PIPWindow />
    </main>
  );
}
