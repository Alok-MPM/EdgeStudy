import Navbar from './src/components/layout/Navbar';
import Home from './src/pages/Home';
import SurvivalKit from './src/pages/SurvivalKit';

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      <Navbar />
      <Home />
      <div className="bg-zinc-950 border-t border-zinc-900">
        <SurvivalKit />
      </div>
    </div>
  );
}