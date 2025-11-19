import React from 'react';
import { CircuitParams } from '../types';

interface ControlsProps {
  params: CircuitParams;
  onChange: (newParams: CircuitParams) => void;
}

const Controls: React.FC<ControlsProps> = ({ params, onChange }) => {
  const handleChange = (key: keyof CircuitParams, value: string) => {
    onChange({
      ...params,
      [key]: parseFloat(value)
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-md">
      <h2 className="text-xl font-bold mb-6 text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-700 pb-2">
        Paramètres du Circuit
      </h2>
      
      <div className="space-y-5">
        {/* Frequency Control */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Fréquence (f)</label>
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{params.f} Hz</span>
          </div>
          <input
            type="range"
            min="10"
            max="2000"
            step="10"
            value={params.f}
            onChange={(e) => handleChange('f', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
        </div>

        {/* Resistance Control (Resistor R) */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Résistance (R)</label>
            <span className="text-sm font-bold text-red-500">{params.R} Ω</span>
          </div>
          <input
            type="range"
            min="10"
            max="1000"
            step="10"
            value={params.R}
            onChange={(e) => handleChange('R', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
        </div>

        {/* Coil Internal Resistance Control (r) */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Bobine: Résistance interne (r)</label>
            <span className="text-sm font-bold text-orange-500">{params.r} Ω</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={params.r}
            onChange={(e) => handleChange('r', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
        </div>

        {/* Inductance Control */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Inductance (L)</label>
            <span className="text-sm font-bold text-blue-500">{params.L.toFixed(3)} H</span>
          </div>
          <input
            type="range"
            min="0.001"
            max="0.5"
            step="0.001"
            value={params.L}
            onChange={(e) => handleChange('L', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
        </div>

        {/* Capacitance Control */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Capacité (C)</label>
            <span className="text-sm font-bold text-green-500">{(params.C * 1e6).toFixed(1)} µF</span>
          </div>
          <input
            type="range"
            min="0.000001"
            max="0.000100"
            step="0.000001"
            value={params.C}
            onChange={(e) => handleChange('C', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
        </div>

        {/* Voltage Control */}
        <div>
          <div className="flex justify-between mb-1">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Tension Générateur (Umax)</label>
            <span className="text-sm font-bold text-purple-500">{params.U_gen} V</span>
          </div>
          <input
            type="range"
            min="1"
            max="24"
            step="0.5"
            value={params.U_gen}
            onChange={(e) => handleChange('U_gen', e.target.value)}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
          />
        </div>
      </div>
    </div>
  );
};

export default Controls;