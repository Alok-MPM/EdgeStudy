export default function Navbar({ navigate }) {
  return (
    <nav className="flex items-center justify-between p-6 bg-zinc-950 border-b border-zinc-800/80">
      <div 
        onClick={() => navigate('home')}
        className="text-2xl font-extrabold tracking-tighter text-zinc-100 cursor-pointer"
      >
        Edge<span className="text-blue-500">Study</span>
      </div>
      <div className="space-x-8 text-sm font-medium text-zinc-400">
        <button onClick={() => navigate('home')} className="hover:text-zinc-100 transition-colors">Home</button>
        <button onClick={() => navigate('dashboard')} className="hover:text-zinc-100 transition-colors">Dashboard</button>
        <button onClick={() => navigate('login')} className="bg-blue-600/10 text-blue-400 px-4 py-2 rounded-full hover:bg-blue-600 hover:text-white transition-all">Sign In</button>
      </div>
    </nav>
  );
}