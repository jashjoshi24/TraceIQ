import React from 'react';
import { Shield, AlertTriangle, Activity, Database, Users } from 'lucide-react';

interface KPIBoxProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  colorClass: string;
}

const KPIBox: React.FC<KPIBoxProps> = ({ title, value, subtitle, icon, colorClass }) => (
  <div className="bg-[#111218] border border-gray-800 p-5 rounded-lg flex flex-col gap-2 relative overflow-hidden group">
    <div className="absolute top-0 left-0 w-1 h-full bg-gray-800 group-hover:bg-blue-500 transition-colors"></div>
    <div className="flex justify-between items-start">
      <p className="text-gray-400 text-sm font-medium">{title}</p>
      <div className={`p-2 rounded-md bg-opacity-10 ${colorClass.replace('text-', 'bg-')} ${colorClass}`}>
        {icon}
      </div>
    </div>
    <p className={`text-3xl font-bold ${colorClass}`}>{value}</p>
    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
  </div>
);

export const SecurityOverviewKPI = ({ data }: { data: any }) => (
  <KPIBox 
    title="Global Risk Score" 
    value={data?.risk_score || '--'} 
    subtitle={`Assets Scanned: ${data?.total_assets || '--'}`}
    icon={<Shield className="w-5 h-5" />} 
    colorClass="text-red-500" 
  />
);

export const ThreatOverviewKPI = ({ data }: { data: any }) => (
  <KPIBox 
    title="Active Threats" 
    value={data?.active_threats || '--'} 
    subtitle={`${data?.new_detections_24h || '--'} new in 24h`}
    icon={<AlertTriangle className="w-5 h-5" />} 
    colorClass="text-orange-500" 
  />
);

export const IncidentOverviewKPI = ({ data }: { data: any }) => (
  <KPIBox 
    title="Open Incidents" 
    value={data?.open || '--'} 
    subtitle={`MTTA: ${data?.mtta_mins || '--'}m | MTTR: ${data?.mttr_hours || '--'}h`}
    icon={<Activity className="w-5 h-5" />} 
    colorClass="text-yellow-500" 
  />
);

export const InvestigationOverviewKPI = ({ data }: { data: any }) => (
  <KPIBox 
    title="Investigations" 
    value={data?.active || '--'} 
    subtitle={`${data?.unassigned || '--'} unassigned cases`}
    icon={<Users className="w-5 h-5" />} 
    colorClass="text-blue-500" 
  />
);

export const EvidenceOverviewKPI = ({ data }: { data: any }) => (
  <KPIBox 
    title="Evidence Vault" 
    value={data?.total_items || '--'} 
    subtitle={`${data?.storage_gb || '--'} GB Total Storage`}
    icon={<Database className="w-5 h-5" />} 
    colorClass="text-emerald-500" 
  />
);
