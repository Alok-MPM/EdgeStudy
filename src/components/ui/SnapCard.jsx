import { useState } from 'react';

export default function SnapCard({ title, category, rank, triggers, bypass }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Main Clickable Card */}
      <div 
        onClick={() => setIsOpen(true)}
        className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-blue-500/50 transition-all hover:-translate-y-1 group cursor-pointer"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-100 group-hover:text-blue-400 transition-colors">{title}</h3>
            <p className="text-xs text-zinc-500 mt-1">{category} | Rank {rank}</p>
          </div>
        </div>
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">🚨 Triggers</p>
          <div className="flex flex-wrap gap-2">
            {triggers.map((word, i) => (
              <span key={i} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-1 rounded-md">
                "{word}"
              </span>
            ))}
          </div>
        </div>
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-lg p-3 mt-4">
          <p className="text-xs font-bold text-rose-500 uppercase mb-1">⚠️ Emergency Bypass</p>
          <p className="text-sm text-zinc-300 line-clamp-2">{bypass}</p>
        </div>
      </div>

      {/* Deep Dive Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          {/* Modal Content Box */}
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            
            {/* Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors bg-zinc-900 rounded-full"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <p className="text-sm font-bold tracking-widest text-blue-500 uppercase mb-2">{category} | Rank {rank}</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-100">{title}</h2>
            </div>

            <div className="space-y-6">
              {/* Detailed Triggers */}
              <div>
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">🚨 Pattern Triggers</h4>
                <div className="flex flex-wrap gap-2">
                  {triggers.map((word, i) => (
                    <span key={i} className="text-sm bg-blue-500/10 text-blue-300 border border-blue-500/20 px-3 py-1.5 rounded-md">
                      "{word}"
                    </span>
                  ))}
                </div>
              </div>

              {/* Full Blueprint */}
              <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-5">
                <h4 className="text-sm font-bold text-rose-500 uppercase mb-2">⚠️ The 80% Bailout (Blueprint)</h4>
                <p className="text-base text-zinc-300 leading-relaxed">{bypass}</p>
              </div>

              {/* Animation/Diagram Placeholder */}
              <div className="border-2 border-dashed border-zinc-800 rounded-xl p-8 text-center flex flex-col items-center justify-center bg-zinc-900/30">
                <svg className="w-10 h-10 text-zinc-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <p className="text-sm text-zinc-500 font-medium">Custom 10-second Animation / Diagram Space</p>
                <p className="text-xs text-zinc-600 mt-1">Visuals will be integrated here</p>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}