import React from 'react';
import { CircuitState } from '../types';

interface MetricsProps {
  state: CircuitState;
}

const Metrics: React.FC<MetricsProps> = ({ state }) => {
  
  const getTypeLabel = () => {
    if (state.type === 'Résonance') return 'Résistif (Résonance)';
    return state.type;
  };

  const getTypeColorClass = () => {
    switch (state.type) {
      case 'Inductif':
        return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700';
      case 'Capacitif':
        return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700';
      case 'Résonance':
      default:
        return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700';
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 uppercase font-bold">Fréq. Résonance</p>
        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{state.resonanceFreq.toFixed(1)} <span className="text-sm text-slate-400">Hz</span></p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 uppercase font-bold">Impédance (Z)</p>
        <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{state.Z.toFixed(1)} <span className="text-sm text-slate-400">Ω</span></p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 uppercase font-bold">Courant (Imax)</p>
        <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{(state.I_max * 1000).toFixed(1)} <span className="text-sm text-slate-400">mA</span></p>
      </div>
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
        <p className="text-xs text-slate-500 uppercase font-bold">Déphasage φ (u/uR)</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            {(state.phi * 180 / Math.PI).toFixed(1)}°
          </p>
        </div>
        <div className={`mt-2 inline-block px-2 py-1 rounded-md text-xs font-bold uppercase border ${getTypeColorClass()}`}>
          {getTypeLabel()}
        </div>
      </div>
    </div>
  );
};

export default Metrics;