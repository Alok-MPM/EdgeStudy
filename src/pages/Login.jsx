export default function Login({ navigate }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] px-4">
      <div className="w-full max-w-md p-8 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
        <h2 className="text-3xl font-extrabold text-zinc-50 mb-2">Welcome Back</h2>
        <p className="text-zinc-400 mb-8">Access your Blue-Chip Survival Kit.</p>
        
        <div className="space-y-4">
          <input type="text" placeholder="Email Address (Dummy)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors" />
          <input type="password" placeholder="Password (Dummy)" className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-200 focus:outline-none focus:border-blue-500 transition-colors" />
          
          <button 
            onClick={() => navigate('dashboard')}
            className="w-full mt-6 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Sign In / Create Account
          </button>
        </div>
      </div>
    </div>
  );
}