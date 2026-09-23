'use client';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050d1a] backdrop-blur-md">
      {/* Bouncing Animated Red-Orange Dots */}
      <div className="flex items-center space-x-2.5">
        <div className="w-3.5 h-3.5 rounded-full bg-[#ff0044] animate-bounce [animation-delay:-0.32s] shadow-lg shadow-red-500/50" />
        <div className="w-3.5 h-3.5 rounded-full bg-[#fe780b] animate-bounce [animation-delay:-0.16s] shadow-lg shadow-amber-500/50" />
        <div className="w-3.5 h-3.5 rounded-full bg-[#ff0044] animate-bounce shadow-lg shadow-red-500/50" />
      </div>
    </div>
  );
}
