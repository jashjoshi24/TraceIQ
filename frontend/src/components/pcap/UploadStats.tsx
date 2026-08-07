"use client";

import React, { useEffect, useState } from 'react';
import { getQueue, getUploads } from '@/lib/api';

interface Stats {
  total: number;
  active: number;
  completed: number;
  failed: number;
}

export function UploadStats({ refreshKey }: { refreshKey?: number }) {
  const [stats, setStats] = useState<Stats>({ total: 0, active: 0, completed: 0, failed: 0 });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [uploadsRes, queueRes] = await Promise.all([getUploads(), getQueue()]);
        if (cancelled) return;
        const captures = uploadsRes.data || [];
        const queue = queueRes.data || [];
        setStats({
          total: captures.length,
          active: queue.length,
          completed: captures.filter((c) => c.status === 'Completed').length,
          failed: captures.filter((c) => c.status === 'Failed').length,
        });
      } catch {
        // Leave stats at their previous values; UploadsTable/ProcessingQueue
        // surface the underlying error to the user.
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  const items = [
    { label: 'Total Uploads', value: String(stats.total) },
    { label: 'Active Jobs', value: String(stats.active) },
    { label: 'Completed', value: String(stats.completed) },
    { label: 'Failed', value: String(stats.failed) },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {items.map((stat, i) => (
        <div key={i} className="bg-[#111218] border border-gray-800 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
          <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
