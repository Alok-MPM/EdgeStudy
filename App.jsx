import { useState } from 'react';
import Navbar from './src/components/layout/Navbar';
import Home from './src/pages/Home';
import Login from './src/pages/Login';
import Dashboard from './src/pages/Dashboard';
import SurvivalKit from './src/pages/SurvivalKit';
import MathKit from './src/pages/MathKit';
import ChemistryKit from './src/pages/ChemistryKit';
import BiologyKit from './src/pages/BiologyKit';
import AccountancyKit from './src/pages/AccountancyKit';
import BusinessStudiesKit from './src/pages/BusinessStudiesKit';
import EconomicsKit from './src/pages/EconomicsKit';
import English12Kit from './src/pages/English12Kit';
import English10Kit from './src/pages/English10Kit';
import Science10Kit from './src/pages/Science10Kit';
import Math10Kit from './src/pages/Math10Kit';

export default function App() {
  const [currentView, setCurrentView] = useState('home');

  return (
    <div className="min-h-screen bg-zinc-950 font-sans">
      <Navbar navigate={setCurrentView} />
      {currentView === 'home' && <Home navigate={setCurrentView} />}
      {currentView === 'login' && <Login navigate={setCurrentView} />}
      {currentView === 'dashboard' && <Dashboard navigate={setCurrentView} />}
      {currentView === 'survival-kit' && <SurvivalKit />}
      {currentView === 'math-kit' && <MathKit />}
      {currentView === 'chemistry-kit' && <ChemistryKit />}
      {currentView === 'biology-kit' && <BiologyKit />}
      {currentView === 'accountancy-kit' && <AccountancyKit />}
      {currentView === 'bst-kit' && <BusinessStudiesKit />}
      {currentView === 'economics-kit' && <EconomicsKit />}
      {currentView === 'english12-kit' && <English12Kit />}
      {currentView === 'english10-kit' && <English10Kit />}
      {currentView === 'science10-kit' && <Science10Kit />}
      {currentView === 'math10-kit' && <Math10Kit />}
    </div>
  );
}
