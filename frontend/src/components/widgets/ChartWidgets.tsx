import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { fetcher } from '@/lib/api';

const COLORS = { Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#3b82f6' };
const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#3b82f6', '#8b5cf6', '#10b981'];

export const ThreatTrendsChart = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetcher('/api/charts/threat-trends').then(setData).catch(console.error);
  }, []);

  return (
    <div className="bg-[#111218] border border-gray-800 rounded-lg p-4 flex flex-col h-64">
      <h3 className="text-sm font-semibold mb-4 text-gray-200">Threat Trends (24h)</h3>
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.Critical} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.Critical} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis dataKey="time" stroke="#6b7280" fontSize={12} tickLine={false} />
            <YAxis stroke="#6b7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111218', borderColor: '#374151', color: '#fff' }} />
            <Area type="monotone" dataKey="Critical" stroke={COLORS.Critical} fillOpacity={1} fill="url(#colorCritical)" />
            <Area type="monotone" dataKey="High" stroke={COLORS.High} fillOpacity={0.1} fill={COLORS.High} />
            <Area type="monotone" dataKey="Medium" stroke={COLORS.Medium} fillOpacity={0.1} fill={COLORS.Medium} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const AlertDistributionChart = () => {
  const [data, setData] = useState([]);
  
  useEffect(() => {
    fetcher('/api/charts/alert-distribution').then(setData).catch(console.error);
  }, []);

  return (
    <div className="bg-[#111218] border border-gray-800 rounded-lg p-4 flex flex-col h-64">
      <h3 className="text-sm font-semibold mb-2 text-gray-200">Alert Distribution</h3>
      <div className="flex-1 w-full min-h-0 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ backgroundColor: '#111218', borderColor: '#374151', color: '#fff', borderRadius: '8px' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((entry: any, index) => (
          <div key={index} className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}></span>
            {entry.name}
          </div>
        ))}
      </div>
    </div>
  );
};
