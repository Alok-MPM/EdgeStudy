export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-6 bg-zinc-950 border-b border-zinc-800/80">
      <div className="text-2xl font-extrabold tracking-tighter text-zinc-100">
        Edge<span className="text-blue-500">Study</span>
      </div>
      <div className="space-x-8 text-sm font-medium text-zinc-400">
        <a href="#" className="hover:text-zinc-100 transition-colors">Home</a>
        <a href="#" className="hover:text-zinc-100 transition-colors">Streams</a>
        <a href="#" className="hover:text-zinc-100 transition-colors">Survival Kit</a>
      </div>
    </nav>
  );
}
