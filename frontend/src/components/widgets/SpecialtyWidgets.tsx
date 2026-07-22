import React, { useEffect, useState } from 'react';
import { fetcher } from '@/lib/api';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

export const AIThreatSummaryWidget = () => {
  const [data, setData] = useState<any>(null);
  
  useEffect(() => {
    fetcher('/api/dashboard/ai-summary').then(setData).catch(console.error);
  }, []);

  return (
    <div className="bg-[#111218] border border-gray-800 rounded-lg flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse-glow"></div>
        <h3 className="font-semibold text-gray-200">AI Threat Summary</h3>
      </div>
      <div className="p-5 text-sm text-gray-300 leading-relaxed flex-1 overflow-y-auto">
        {data ? (
          <p>{data.narrative}</p>
        ) : (
          <p className="text-gray-500">Generating intelligence summary...</p>
        )}
      </div>
    </div>
  );
};

export const LiveActivityFeedWidget = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    // Simulate websocket/live feed with interval
    const messages = [
      "Alert ALT-1033 escalated to Incident INC-204",
      "Malware blocked on Workstation DEV-102",
      "Multiple failed logins detected from 192.168.1.44",
      "New IP added to Threat Intel blocklist: 104.21.34.12",
      "Analyst Alice assigned to Incident INC-201",
      "PCAP upload parsed successfully (324mb)"
    ];
    
    let currentEvents: any[] = [];
    const interval = setInterval(() => {
      const newEvent = {
        id: Math.random().toString(),
        time: new Date().toLocaleTimeString(),
        text: messages[Math.floor(Math.random() * messages.length)]
      };
      currentEvents = [newEvent, ...currentEvents].slice(0, 15);
      setEvents(currentEvents);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#111218] border border-gray-800 rounded-lg flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <Activity className="w-4 h-4 text-green-500" />
        <h3 className="font-semibold text-gray-200">Live Activity Feed</h3>
      </div>
      <div className="p-2 flex-1 overflow-y-auto">
        {events.length === 0 && <div className="p-4 text-sm text-gray-500 text-center">Listening for events...</div>}
        {events.map((evt) => (
          <div key={evt.id} className="p-2 border-b border-gray-800/30 text-xs flex gap-3 hover:bg-[#1a1c23]/50 transition-colors">
            <span className="text-gray-500 font-mono whitespace-nowrap">{evt.time}</span>
            <span className="text-gray-300">{evt.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SystemHealthWidget = () => {
  const [health, setHealth] = useState<any[]>([]);

  useEffect(() => {
    fetcher('/api/system/health').then(setHealth).catch(console.error);
  }, []);

  return (
    <div className="bg-[#111218] border border-gray-800 rounded-lg flex flex-col h-full">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <Cpu className="w-4 h-4 text-gray-400" />
        <h3 className="font-semibold text-gray-200">System Health</h3>
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-3">
          {health.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <span className="text-gray-400">{item.service}</span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-500 font-mono">{item.latency}</span>
                <span className={`px-2 py-0.5 rounded text-xs ${item.status === 'Healthy' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
