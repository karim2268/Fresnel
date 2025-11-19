import React, { useState, useMemo } from 'react';
import { calculateCircuitState, generateWaveforms } from './utils/physics';
import { CircuitParams } from './types';
import Controls from './components/Controls';
import WaveformChart from './components/WaveformChart';
import FresnelDiagram from './components/FresnelDiagram';
import Metrics from './components/Metrics';
import { explainCircuitState } from './services/geminiService';

// Icons
import { Zap, Activity, BookOpen, RefreshCw } from 'lucide-react';

const App: React.FC = () => {
  // Initial State
  const [params, setParams] = useState<CircuitParams>({
    R: 200,
    r: 10, // Internal resistance of coil default
    L: 0.1, // 100 mH
    C: 0.000010, // 10 uF
    f: 100,
    U_gen: 10
  });

  const [explanation, setExplanation] = useState<string>("");
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Memoized Calculations
  const circuitState = useMemo(() => calculateCircuitState(params), [params]);
  const waveforms = useMemo(() => generateWaveforms(params, circuitState), [params, circuitState]);

  const handleAIHelp = async () => {
    setIsLoadingAI(true);
    const text = await explainCircuitState(params, circuitState);
    setExplanation(text);
    setIsLoadingAI(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-200 p-4 md:p-8">
      <header className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/30">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-500 dark:from-indigo-400 dark:to-violet-400">
              RLC Simulator
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">Bobine Réelle (L,r) - Fresnel & Temporel</p>
          </div>
        </div>
        <div className="flex gap-2">
             {/* Placeholder for potential future nav or settings */}
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Controls params={params} onChange={setParams} />
          
          {/* AI Teacher Card */}
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-xl p-6 shadow-lg text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold text-lg">Assistant Pédagogique</h3>
            </div>
            <p className="text-indigo-200 text-sm mb-4">
              Besoin d'explications sur le comportement actuel du circuit et l'impact de la résistance interne ?
            </p>
            
            {!explanation ? (
              <button 
                onClick={handleAIHelp}
                disabled={isLoadingAI}
                className="w-full py-2 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isLoadingAI ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <BookOpen className="w-4 h-4" />
                )}
                {isLoadingAI ? "Analyse en cours..." : "Expliquer cet état"}
              </button>
            ) : (
              <div className="bg-black/20 rounded-lg p-4 text-sm text-indigo-100 animate-fadeIn border border-white/10">
                <div className="prose prose-invert prose-sm max-w-none">
                   {/* Simple markdown-like rendering */}
                   {explanation.split('\n').map((line, i) => (
                     <p key={i} className="mb-2">{line}</p>
                   ))}
                </div>
                <button 
                  onClick={() => setExplanation("")}
                  className="text-xs text-indigo-300 underline mt-2 hover:text-white"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Visualization (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Metrics state={circuitState} />
          
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <FresnelDiagram state={circuitState} />
            <WaveformChart data={waveforms} />
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border-l-4 border-orange-500">
             <h3 className="font-bold text-slate-800 dark:text-white mb-2">Note sur la Bobine Réelle</h3>
             <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
               Contrairement à une bobine idéale, le vecteur tension de la bobine <strong>U_bobine</strong> (en orange) n'est pas perpendiculaire au courant. 
               Il est incliné car il contient une composante résistive (r) en phase avec le courant et une composante inductive (L) en quadrature.
               La tension totale vue par le GBF est la somme de U_R, U_bobine et U_C.
             </p>
          </div>
        </div>

      </main>
    </div>
  );
};

export default App;