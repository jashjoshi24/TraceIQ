"use client";

import React, { useEffect, useState } from 'react';
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
    <div className="p-6 space-y-6">
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
    </div>
  );
}
