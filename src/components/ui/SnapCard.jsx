export default function SnapCard({ title, category, rank, triggers, bypass }) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-5 hover:border-blue-500/50 transition-all hover:-translate-y-1 group">
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
        <p className="text-sm text-zinc-300">{bypass}</p>
      </div>
    </div>
  );
}