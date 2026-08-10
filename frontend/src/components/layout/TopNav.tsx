"use client";

import React from 'react';
import { Shield, Search, Bell, Settings, TerminalSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '../../store/authStore';

export default function TopNav() {
  const { user, roles } = useAuthStore();

  const firstName = user?.profile?.first_name?.trim();
  const lastName = user?.profile?.last_name?.trim();
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || user?.username || 'Guest';
  const primaryRole = roles[0] || 'User';

  const initials = firstName || lastName
    ? `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
    : (user?.username || '??').slice(0, 2).toUpperCase();

  return (
    <header className="flex items-center justify-between px-6 py-3 bg-[#111218] border-b border-gray-800 shrink-0">
      <div className="flex items-center gap-3">
        <Shield className="w-6 h-6 text-blue-500" />
        <h1 className="text-xl font-bold tracking-wider">TRACE<span className="text-blue-500">IQ</span></h1>
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
        <Link href="/profile" className="flex items-center gap-3 pl-6 border-l border-gray-800 no-underline">
          <div className="text-right hidden md:block">
            <p className="text-sm font-medium text-white">{fullName}</p>
            <p className="text-xs text-blue-400">{primaryRole}</p>
          </div>
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center border border-gray-700 shadow-sm cursor-pointer hover:opacity-90">
            <span className="text-xs font-bold shadow-sm">{initials}</span>
          </div>
        </Link>
      </div>
    </header>
  );
}
