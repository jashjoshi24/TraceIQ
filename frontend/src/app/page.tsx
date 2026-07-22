"use client";

import React, { useEffect, useState } from 'react';
import { Shield, Activity, AlertTriangle, Search, Bell, Settings, User, TerminalSquare } from 'lucide-react';
import { fetcher } from '@/lib/api';

import { 
  SecurityOverviewKPI, ThreatOverviewKPI, IncidentOverviewKPI, InvestigationOverviewKPI, EvidenceOverviewKPI 
} from '@/components/widgets/KPIWidgets';
import { ThreatTrendsChart, AlertDistributionChart } from '@/components/widgets/ChartWidgets';
import { AlertsTableWidget, IncidentsTableWidget } from '@/components/widgets/TableWidgets';
import { AIThreatSummaryWidget, LiveActivityFeedWidget, SystemHealthWidget } from '@/components/widgets/SpecialtyWidgets';

export default function SOCDashboard() {
  const [overview, setOverview] = useState<any>(null);

  useEffect(() => {
    fetcher('/api/dashboard/overview')
      .then(setOverview)
      .catch(console.error);
  }, []);

  return (
    <div className="flex h-screen w-full flex-col bg-[#0b0c10] text-gray-100 font-sans overflow-hidden">
      {/* Top Navigation */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#111218] border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-blue-500" />
          <h1 className="text-xl font-bold tracking-wider">SENTINEL<span className="text-blue-500">X</span></h1>
        </div>
        
        <div className="flex-1 max-w-2xl px-12">
          <div className="relative group">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search alerts, IPs, hashes... (Cmd+K)" 
              className="w-full bg-[#1a1c23] border border-gray-700 rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500 transition-all placeholder:text-gray-600"
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <button className="relative p-1.5 rounded hover:bg-gray-800 transition-colors">
              <TerminalSquare className="w-5 h-5 text-gray-400 hover:text-gray-200" />
            </button>
            <button className="relative p-1.5 rounded hover:bg-gray-800 transition-colors">
              <Bell className="w-5 h-5 text-gray-400 hover:text-gray-200" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse-glow"></span>
            </button>
            <button className="relative p-1.5 rounded hover:bg-gray-800 transition-colors">
              <Settings className="w-5 h-5 text-gray-400 hover:text-gray-200" />
            </button>
          </div>
          <div className="flex items-center gap-3 pl-6 border-l border-gray-800">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium">Jash Joshi</p>
              <p className="text-xs text-blue-400">SOC Analyst</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center border border-gray-700 shadow-sm cursor-pointer hover:opacity-90">
              <span className="text-xs font-bold shadow-sm">JJ</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[72px] flex flex-col items-center py-6 bg-[#111218] border-r border-gray-800 shrink-0 gap-6 z-10 shadow-xl">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)]"><Activity className="w-5 h-5" /></div>
          <div className="p-3 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-gray-800/50 cursor-pointer transition-all"><AlertTriangle className="w-5 h-5" /></div>
          <div className="p-3 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-gray-800/50 cursor-pointer transition-all"><Shield className="w-5 h-5" /></div>
        </aside>

        {/* Main Dashboard Area */}
        <main className="flex-1 overflow-y-auto bg-[#0b0c10] p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-gray-100">Security Overview</h2>
              <p className="text-sm text-gray-500 mt-1">Enterprise SOC Posture and Active Threats</p>
            </div>
            <div className="flex gap-3">
              <select className="px-4 py-2 bg-[#1a1c23] border border-gray-700 rounded-md text-sm text-gray-300 focus:outline-none focus:border-blue-500 appearance-none pr-8 cursor-pointer">
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 rounded-md text-sm hover:bg-blue-700 transition-colors text-white font-medium shadow-lg shadow-blue-500/20">
                Generate Report
              </button>
            </div>
          </div>

          {/* KPI Strip */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <SecurityOverviewKPI data={overview?.security} />
            <ThreatOverviewKPI data={overview?.threat} />
            <IncidentOverviewKPI data={overview?.incident} />
            <InvestigationOverviewKPI data={overview?.investigation} />
            <EvidenceOverviewKPI data={overview?.evidence} />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <ThreatTrendsChart />
            </div>
            <div>
              <AlertDistributionChart />
            </div>
          </div>

          {/* Complex Widgets Row 1 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <AlertsTableWidget />
            </div>
            <div className="flex flex-col gap-6">
              <div className="flex-1">
                <AIThreatSummaryWidget />
              </div>
              <div className="flex-1">
                <SystemHealthWidget />
              </div>
            </div>
          </div>

          {/* Complex Widgets Row 2 */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-8">
            <div className="xl:col-span-2">
              <IncidentsTableWidget />
            </div>
            <div className="h-[400px]">
              <LiveActivityFeedWidget />
            </div>
          </div>
          
        </main>
      </div>
    </div>
  );
}
