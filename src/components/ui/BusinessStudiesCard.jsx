import { useState } from 'react';

export default function BusinessStudiesCard({ title, category, rank, triggers, bypass, visual_blueprint }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-blue-600/50 transition-all cursor-pointer group">
        <h3 className="text-xl font-bold text-zinc-100 group-hover:text-blue-500 mb-1">{title}</h3>
        <p className="text-xs text-zinc-500 mb-4">{category} | Rank {rank}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {triggers.map((word, i) => (
            <span key={i} className="text-xs bg-blue-600/10 text-blue-400 border border-blue-600/20 px-2 py-1 rounded">{word}</span>
          ))}
        </div>
        <div className="bg-rose-950/20 border border-rose-900/50 rounded-lg p-3">
          <p className="text-xs font-bold text-rose-500 mb-1">⚠️ CASE STUDY HACK</p>
          <p className="text-sm text-zinc-300 line-clamp-2">{bypass}</p>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 px-3 py-1 text-zinc-400 hover:text-white bg-zinc-900 rounded-full font-bold">✕</button>
            <p className="text-sm font-bold text-blue-500 uppercase mb-2">{category} | Rank {rank}</p>
            <h2 className="text-3xl font-bold text-zinc-100 mb-6">{title}</h2>
            <div className="flex flex-wrap gap-2 mb-6">
              {triggers.map((word, i) => (
                <span key={i} className="text-sm bg-blue-600/10 text-blue-400 border border-blue-600/20 px-3 py-1 rounded font-mono italic font-bold text-blue-300">"{word}"</span>
              ))}
            </div>
            <div className="bg-rose-950/20 border border-rose-900/50 rounded-xl p-5 mb-6">
              <h4 className="text-sm font-bold text-rose-500 uppercase mb-2">⚠️ The 80% Bailout</h4>
              <p className="text-zinc-300">{bypass}</p>
            </div>
            {visual_blueprint !== "None" && (
              <div className="border-2 border-dashed border-blue-900/50 rounded-xl p-6 text-center bg-blue-950/10">
                <p className="text-sm text-blue-500 font-medium">Format / Diagram Blueprint</p>
                <p className="text-sm text-zinc-300 mt-2">{visual_blueprint}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}