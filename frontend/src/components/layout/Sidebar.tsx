"use client";

import React from 'react';
import { Activity, AlertTriangle, Shield, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Sidebar() {
  const pathname = usePathname();

  const getIconClass = (path: string) => {
    return pathname === path 
      ? "p-3 rounded-xl bg-blue-500/10 text-blue-500 cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.15)]"
      : "p-3 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-gray-800/50 cursor-pointer transition-all";
  };

  return (
    <aside className="w-[72px] flex flex-col items-center py-6 bg-[#111218] border-r border-gray-800 shrink-0 gap-6 z-10 shadow-xl">
      <Link href="/">
        <div className={getIconClass('/')} title="Dashboard">
          <Activity className="w-5 h-5" />
        </div>
      </Link>
      
      <Link href="/pcap">
        <div className={getIconClass('/pcap')} title="PCAP Manager">
          <UploadCloud className="w-5 h-5" />
        </div>
      </Link>

      <div className="p-3 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-gray-800/50 cursor-pointer transition-all" title="Incidents">
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div className="p-3 rounded-xl text-gray-500 hover:text-gray-200 hover:bg-gray-800/50 cursor-pointer transition-all" title="Investigations">
        <Shield className="w-5 h-5" />
      </div>
    </aside>
  );
}
