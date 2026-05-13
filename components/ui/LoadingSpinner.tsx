"use client";

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Outer Glow Ring */}
        <div className="absolute w-24 h-24 rounded-full border-2 border-red-500/10 animate-[ping_1.5s_linear_infinite]" />
        
        {/* Middle Pulsing Ring */}
        <div className="absolute w-20 h-20 rounded-full border-2 border-red-500/20 animate-[pulse_2s_ease-in-out_infinite]" />

        {/* Main Rotating Spinner */}
        <div className="relative w-16 h-16">
          {/* Inner Track */}
          <div className="absolute inset-0 border-4 rounded-full border-white/5" />
          
          {/* Moving Part */}
          <div className="absolute inset-0 border-4 border-transparent rounded-full border-t-red-500 border-r-red-500/30 animate-spin" />
          
          {/* Center Glow Point */}
          <div className="absolute inset-[35%] bg-red-500 rounded-full blur-[2px] animate-pulse" />
        </div>

        {/* Optional Logo or Icon inside */}
        <div className="absolute -bottom-12">
          <p className="text-xs font-medium tracking-[0.2em] text-red-500 uppercase animate-pulse">
            Securely Loading
          </p>
        </div>
      </div>

      {/* Background Particles (Optional: matching your Hero style) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-600/10 blur-[100px]" />
      </div>
    </div>
  );
}