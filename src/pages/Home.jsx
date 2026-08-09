export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
      
      {/* Version Tag */}
      <div className="inline-block px-4 py-1.5 mb-8 text-xs font-bold tracking-widest text-blue-400 uppercase border border-blue-500/20 rounded-full bg-blue-500/10">
        Version 1.0 - Board Exam Bypass
      </div>
      
      {/* Main Headline */}
      <h1 className="max-w-4xl text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-50 leading-tight">
        Survive the Syllabus. <br/>
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Master the Board.</span>
      </h1>
      
      {/* Sub-headline */}
      <p className="max-w-2xl mt-6 text-lg text-zinc-400">
        Don't study 100% of the syllabus to get 50% marks. Study the top 25 Blue-Chip concepts to secure your 80% Bailout. No fluff, just the hacks.
      </p>
      
      {/* CTA Button */}
      <button className="px-8 py-4 mt-10 text-sm font-bold text-black transition-all rounded-full bg-zinc-100 hover:bg-white hover:scale-105 shadow-[0_0_20px_rgba(255,255,255,0.2)]">
        Start Survival Mode
      </button>
      
    </div>
  );
}
