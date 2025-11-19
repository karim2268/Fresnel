import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TimeDataPoint } from '../types';

interface WaveformChartProps {
  data: TimeDataPoint[];
}

const WaveformChart: React.FC<WaveformChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md h-[400px] flex flex-col">
      <h3 className="text-lg font-semibold mb-2 text-slate-700 dark:text-slate-200">Oscilloscope (Domaine Temporel)</h3>
      <div className="flex-grow w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2} />
            <XAxis 
              dataKey="time" 
              label={{ value: 'Temps (ms)', position: 'insideBottomRight', offset: -5, fill: '#94a3b8' }} 
              tick={{fill: '#94a3b8'}}
            />
            <YAxis 
              label={{ value: 'Tension (V)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} 
              tick={{fill: '#94a3b8'}}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} 
              itemStyle={{ color: '#f8fafc' }}
              labelFormatter={(v) => `${Number(v).toFixed(2)} ms`}
            />
            <Legend wrapperStyle={{ paddingTop: '10px' }}/>
            
            <Line type="monotone" dataKey="u_source" stroke="#8b5cf6" strokeWidth={2} name="u(t) GBF" dot={false} />
            {/* Display scaled current */}
            <Line type="monotone" dataKey="i_scaled" stroke="#cbd5e1" strokeDasharray="5 5" strokeWidth={2} name="i(t) Courant" dot={false} />
            
            <Line type="monotone" dataKey="u_R" stroke="#ef4444" strokeWidth={1.5} name="u_R(t)" dot={false} />
            
            {/* Real Coil Voltage instead of ideal inductor */}
            <Line type="monotone" dataKey="u_coil" stroke="#f97316" strokeWidth={1.5} name="u_Bobine(t)" dot={false} />
            
            <Line type="monotone" dataKey="u_C" stroke="#10b981" strokeWidth={1.5} name="u_C(t)" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WaveformChart;