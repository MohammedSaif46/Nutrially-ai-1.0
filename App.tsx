import React, { useState, useEffect } from 'react';
import CalculatorForm from './components/CalculatorForm';
import PlanDisplay from './components/PlanDisplay';
import { UserData, DietPlan, Stats } from './types';
import { calculateStats } from './utils/calculations';
import { generateDietPlan } from './services/gemini';

const App: React.FC = () => {
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBtn(true);
    });

    window.addEventListener('appinstalled', () => {
      setShowInstallBtn(false);
      setDeferredPrompt(null);
    });
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBtn(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'NutriAlly AI',
          text: 'Check out this AI-powered Indian Diet & Supplement planner!',
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleGenerate = async (data: UserData) => {
    setError(null);
    setUserData(data);
    const calculatedStats = calculateStats(data);
    setStats(calculatedStats);
    setLoading(true);
    
    try {
      const plan = await generateDietPlan(data, calculatedStats);
      setDietPlan(plan);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate plan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setDietPlan(null);
    setStats(null);
    setUserData(null);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#fcfdff] selection:bg-indigo-100 flex flex-col relative overflow-x-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-[600px] h-[600px] bg-indigo-100/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-100/30 rounded-full blur-[100px] pointer-events-none" />

      <header className="bg-white/70 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-50 no-print transition-all duration-300">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={handleReset}>
            <div className="w-12 h-12 overflow-hidden rounded-2xl shadow-xl shadow-indigo-100 group-hover:scale-105 transition-all duration-500 bg-white p-1">
              <img src="logo.png" alt="NutriAlly Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">NutriAlly<span className="text-indigo-600">.</span></h1>
              <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-0.5 opacity-60">AI Diet Partner</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {showInstallBtn && (
              <button 
                onClick={handleInstall}
                className="hidden md:flex text-xs font-black bg-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-black transition-all shadow-lg active:scale-95"
              >
                Get Mobile App
              </button>
            )}
            <button 
              onClick={handleShare}
              className="p-2.5 text-slate-400 hover:text-indigo-600 transition-all rounded-xl hover:bg-indigo-50"
              title="Share App"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
            {(dietPlan || stats) && (
              <button 
                className="text-sm font-bold text-slate-500 hover:text-rose-600 transition-all px-4 py-2 rounded-xl hover:bg-rose-50"
                onClick={handleReset}
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 sm:px-6 pt-12 pb-24 relative z-10">
        {!stats && !loading && (
          <div className="text-center mb-16 animate-in fade-in slide-in-from-top-6 duration-1000">
            <div className="flex justify-center mb-10 relative">
              <div className="absolute inset-0 bg-indigo-200/20 blur-[80px] rounded-full" />
              <div className="w-40 h-40 sm:w-56 sm:h-56 bg-white rounded-[3rem] shadow-2xl shadow-indigo-200/50 p-6 logo-hover relative group">
                <img 
                  src="logo.png" 
                  alt="NutriAlly Fitness Brand" 
                  className="w-full h-full object-contain animate-float" 
                  style={{ animation: 'float 6s ease-in-out infinite' }}
                />
                <style>{`
                  @keyframes float {
                    0%, 100% { transform: translateY(0) rotate(0); }
                    50% { transform: translateY(-15px) rotate(2deg); }
                  }
                `}</style>
              </div>
            </div>
            
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 px-5 py-2 text-xs font-black tracking-widest text-indigo-700 uppercase bg-indigo-50/80 rounded-full border border-indigo-100/50 backdrop-blur-sm">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Official AI Nutrition Partner
              </span>
              
              <h2 className="text-5xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-[0.9] max-w-4xl mx-auto">
                Crafting Your <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-600">Peak Performance.</span>
              </h2>
              
              <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto font-medium leading-relaxed px-4">
                Personalized Indian diet protocols and supplement stacks engineered for weight loss, muscle gain, and pure metabolic efficiency.
              </p>
            </div>
          </div>
        )}

        {loading && (
          <div className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-indigo-500/20 blur-[60px] animate-pulse rounded-full" />
              <div className="w-32 h-32 relative z-10 p-4 bg-white rounded-[2rem] shadow-2xl shadow-indigo-100">
                <img 
                  src="logo.png" 
                  alt="Crafting Plan" 
                  className="w-full h-full object-contain animate-pulse" 
                />
              </div>
              <div className="absolute -inset-4 border-4 border-indigo-600/10 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-black text-slate-900 tracking-tight italic">Analyzing Metabolic Profile...</h3>
              <p className="text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Syncing with Regional Cuisine Maps</p>
            </div>
          </div>
        )}

        {error && (
          <div className="max-w-xl mx-auto mb-12 bg-rose-50 border border-rose-100 p-6 rounded-3xl text-rose-700 text-center animate-in zoom-in-95 shadow-lg shadow-rose-100/50">
            <p className="font-black flex items-center justify-center gap-3 text-lg">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
              {error}
            </p>
            <button 
              onClick={handleReset} 
              className="mt-4 px-6 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-black uppercase tracking-wider hover:bg-rose-700 transition-all shadow-md active:scale-95"
            >
              Adjust Parameters
            </button>
          </div>
        )}

        {!stats && !loading && (
          <div className="relative z-20">
            <CalculatorForm onCalculate={handleGenerate} isLoading={loading} />
          </div>
        )}

        {stats && userData && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-12 duration-700">
            <PlanDisplay 
              plan={dietPlan} 
              stats={stats} 
              userData={userData}
              isGenerating={loading} 
              onReset={handleReset}
            />
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-10 right-6 z-50 flex flex-col gap-4 no-print">
        {showInstallBtn && (
          <button 
            onClick={handleInstall}
            className="bg-white text-indigo-600 p-5 rounded-[1.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.15)] border border-indigo-50 hover:border-indigo-200 active:scale-90 transition-all flex items-center justify-center"
            title="Install Mobile App"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </button>
        )}
        {dietPlan && (
          <button 
            onClick={() => window.print()}
            className="bg-indigo-600 text-white p-5 rounded-[1.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] hover:bg-indigo-700 active:scale-90 transition-all flex items-center justify-center group"
            title="Download PDF Plan"
          >
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        )}
      </div>

      <footer className="max-w-6xl mx-auto w-full px-6 py-12 border-t border-slate-100 text-center no-print">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 grayscale opacity-20 hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer" onClick={handleReset}>
             <img src="logo.png" alt="Footer Logo" className="w-full h-full object-contain" />
          </div>
          <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">© 2025 NutriAlly Labs • Precision Indian Nutrition</p>
        </div>
      </footer>
    </div>
  );
};

export default App;