import React, { useState, useMemo } from 'react';
import { calculateCircuitState, generateWaveforms } from './utils/physics';
import { CircuitParams } from './types';
import Controls from './components/Controls';
import WaveformChart from './components/WaveformChart';
import FresnelDiagram from './components/FresnelDiagram';
import Metrics from './components/Metrics';

// Icons
import { Activity } from 'lucide-react';

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

  // Memoized Calculations
  const circuitState = useMemo(() => calculateCircuitState(params), [params]);
  const waveforms = useMemo(() => generateWaveforms(params, circuitState), [params, circuitState]);

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