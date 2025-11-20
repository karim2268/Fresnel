import React from 'react';
import { CircuitState } from '../types';
import { Info } from 'lucide-react';

interface MetricsProps {
  state: CircuitState;
}

const Metrics: React.FC<MetricsProps> = ({ state }) => {
  
  const getTypeLabel = () => {
    if (state.type === 'Résonance') return 'Résistif (Résonance)';
    return state.type;
  };

  const getTypeDescription = () => {
    switch (state.type) {
      case 'Inductif':
        return "La fréquence est supérieure à la résonance (f > f0). L'effet de la bobine l'emporte (UL > UC), le courant est en retard sur la tension.";
      case 'Capacitif':
        return "La fréquence est inférieure à la résonance (f < f0). L'effet du condensateur l'emporte (UC > UL), le courant est en avance sur la tension.";
      case 'Résonance':
        return "La fréquence est proche de f0. Les réactances s'annulent (UL ≈ UC). L'impédance est minimale (Z ≈ R+r) et le courant est maximal.";
      default:
        return "";
    }
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
      <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-visible">
        <p className="text-xs text-slate-500 uppercase font-bold">Déphasage φ (u/uR)</p>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">
            {(state.phi * 180 / Math.PI).toFixed(1)}°
          </p>
        </div>
        
        {/* Badge avec Tooltip au survol */}
        <div className="relative group mt-2 inline-block">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold uppercase border cursor-help ${getTypeColorClass()}`}>
            {getTypeLabel()}
            <Info size={12} className="opacity-70" />
          </div>
          
          {/* Tooltip */}
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 w-48 bg-slate-800 text-white text-[11px] font-medium rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none leading-tight">
            {getTypeDescription()}
            {/* Petite flèche CSS */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Metrics;