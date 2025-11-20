import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimeDataPoint } from '../types';
import { Eye, EyeOff } from 'lucide-react';

interface WaveformChartProps {
  data: TimeDataPoint[];
}

type TraceKey = 'u_source' | 'i_scaled' | 'u_R' | 'u_coil' | 'u_C';

interface TraceConfig {
  key: TraceKey;
  label: string;
  color: string;
  dashed?: boolean;
}

const WaveformChart: React.FC<WaveformChartProps> = ({ data }) => {
  // État pour gérer la visibilité des courbes
  const [visibleTraces, setVisibleTraces] = useState<Record<TraceKey, boolean>>({
    u_source: true,
    i_scaled: true,
    u_R: true,
    u_coil: true,
    u_C: true
  });

  const toggleTrace = (key: TraceKey) => {
    setVisibleTraces(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const traces: TraceConfig[] = [
    { key: 'u_source', label: 'u(t) GBF', color: '#8b5cf6' },
    { key: 'i_scaled', label: 'i(t) Courant', color: '#94a3b8', dashed: true },
    { key: 'u_R', label: 'u_R', color: '#ef4444' },
    { key: 'u_coil', label: 'u_Bobine', color: '#f97316' },
    { key: 'u_C', label: 'u_C', color: '#10b981' },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md h-[450px] flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 shrink-0">Oscilloscope</h3>
        
        {/* Filtres */}
        <div className="flex flex-wrap gap-2 justify-start md:justify-end">
            {traces.map((t) => (
                <button
                    key={t.key}
                    onClick={() => toggleTrace(t.key)}
                    className={`flex items-center text-[11px] sm:text-xs px-3 py-1.5 rounded-full border transition-all duration-200 select-none font-medium
                        ${visibleTraces[t.key] 
                            ? 'bg-opacity-10 shadow-sm' 
                            : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600'}
                    `}
                    style={visibleTraces[t.key] ? {
                        backgroundColor: `${t.color}1A`, // ~10% opacity
                        borderColor: t.color,
                        color: t.color,
                    } : {}}
                    title={visibleTraces[t.key] ? "Masquer la courbe" : "Afficher la courbe"}
                >
                    {visibleTraces[t.key] ? <Eye size={14} className="mr-1.5" /> : <EyeOff size={14} className="mr-1.5" />}
                    {t.dashed && <span className="w-3 h-0 border-t border-dashed border-current mr-1.5"></span>}
                    {t.label}
                </button>
            ))}
        </div>
      </div>

      <div className="flex-grow w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
            <XAxis 
              dataKey="time" 
              label={{ value: 'ms', position: 'insideBottomRight', offset: -5, fill: '#94a3b8', fontSize: 12 }} 
              tick={{fill: '#94a3b8', fontSize: 12}}
              tickFormatter={(val) => Number(val).toFixed(1)}
            />
            <YAxis 
              label={{ value: 'V', angle: -90, position: 'insideLeft', offset: 10, fill: '#94a3b8', fontSize: 12 }} 
              tick={{fill: '#94a3b8', fontSize: 12}}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc', fontSize: '12px' }} 
              itemStyle={{ padding: 0 }}
              labelFormatter={(v) => `${Number(v).toFixed(2)} ms`}
              formatter={(value: number) => value.toFixed(2)}
            />
            
            {traces.map(t => (
                visibleTraces[t.key] && (
                    <Line 
                        key={t.key}
                        type="monotone" 
                        dataKey={t.key} 
                        stroke={t.color} 
                        strokeWidth={2} 
                        strokeDasharray={t.dashed ? "5 5" : undefined}
                        name={t.label} 
                        dot={false}
                        isAnimationActive={false} // Améliore la réactivité lors du basculement
                    />
                )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WaveformChart;