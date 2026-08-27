export default function Dashboard({ navigate }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-zinc-50 mb-2">Choose Your Arsenal</h1>
        <p className="text-zinc-400">Select a subject to enter Survival Mode.</p>
      </div>
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-zinc-100 mb-4 border-b border-zinc-800 pb-2">Class 12</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div onClick={() => navigate('survival-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-500/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">Physics</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
          <div onClick={() => navigate('math-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-emerald-500/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">Mathematics</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
          <div onClick={() => navigate('chemistry-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-violet-500/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">Chemistry</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
          <div onClick={() => navigate('biology-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-fuchsia-500/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">Biology</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
          <div onClick={() => navigate('accountancy-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-amber-500/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">Accountancy</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
          <div onClick={() => navigate('bst-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-blue-600/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">Business Studies</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
          <div onClick={() => navigate('economics-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-cyan-500/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">Economics</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
          <div onClick={() => navigate('english12-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-rose-500/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">English Core</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-zinc-100 mb-4 border-b border-zinc-800 pb-2">Class 10</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div onClick={() => navigate('english10-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-indigo-500/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">English</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
          <div onClick={() => navigate('science10-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-teal-500/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">Science</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
          <div onClick={() => navigate('math10-kit')} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-lime-500/50 transition-colors cursor-pointer"><h3 className="text-xl font-bold text-zinc-100 mb-2">Mathematics</h3><p className="text-sm text-zinc-400">Master the Blue-Chip concepts.</p></div>
        </div>
      </div>
    </div>
  );
}
