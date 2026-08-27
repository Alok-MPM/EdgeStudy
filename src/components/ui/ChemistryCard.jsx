import { useState } from 'react';

export default function ChemistryCard({ title, category, rank, triggers, bypass, visual_blueprint }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-violet-500/50 transition-all hover:-translate-y-1 group cursor-pointer">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-zinc-100 group-hover:text-violet-400 transition-colors">{title}</h3>
            <p className="text-xs text-zinc-500 mt-1">{category} | Rank {rank}</p>
          </div>
        </div>
        <div className="mb-4 space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">🚨 Triggers</p>
          <div className="flex flex-wrap gap-2">
            {triggers.map((word, i) => (
              <span key={i} className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2 py-1 rounded-md">"{word}"</span>
            ))}
          </div>
        </div>
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-lg p-3 mt-4">
          <p className="text-xs font-bold text-rose-500 uppercase mb-1">⚠️ The Blueprint</p>
          <p className="text-sm text-zinc-300 line-clamp-2">{bypass}</p>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white transition-colors bg-zinc-900 rounded-full">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="mb-6">
              <p className="text-sm font-bold tracking-widest text-violet-500 uppercase mb-2">{category} | Rank {rank}</p>
              <h2 className="text-3xl md:text-4xl font-extrabold text-zinc-100">{title}</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">🚨 Pattern Triggers</h4>
                <div className="flex flex-wrap gap-2">
                  {triggers.map((word, i) => (
                    <span key={i} className="text-sm bg-violet-500/10 text-violet-300 border border-violet-500/20 px-3 py-1.5 rounded-md">"{word}"</span>
                  ))}
                </div>
              </div>
              <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-5">
                <h4 className="text-sm font-bold text-rose-500 uppercase mb-2">⚠️ The 80% Bailout (Blueprint)</h4>
                <p className="text-base text-zinc-300 leading-relaxed">{bypass}</p>
              </div>
              {visual_blueprint && visual_blueprint !== "None" && (
                <div className="border-2 border-dashed border-violet-900/50 rounded-xl p-6 text-center flex flex-col items-center justify-center bg-violet-950/10">
                  <svg className="w-10 h-10 text-violet-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                  <p className="text-sm text-violet-500 font-medium">3D Animation / Mechanism Blueprint</p>
                  <p className="text-sm text-zinc-300 mt-2">{visual_blueprint}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}