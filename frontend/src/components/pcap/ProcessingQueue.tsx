"use client";

import React, { useEffect, useState } from 'react';
import { getQueue, WS_BASE_URL } from '@/lib/api';
import { usePcapWebSocket } from '@/lib/usePcapWebSocket';

interface QueueJob {
  job_id: string;
  capture_id: string;
  stage: string;
  progress: number;
}

const TERMINAL_STAGES = new Set(['Completed', 'Failed', 'Cancelled']);

export function ProcessingQueue({ refreshKey }: { refreshKey?: number }) {
  const [jobs, setJobs] = useState<Record<string, QueueJob>>({});
  const { jobs: liveJobs, isConnected } = usePcapWebSocket(WS_BASE_URL);

  // Initial snapshot from the REST endpoint (covers jobs already in flight
  // before this page/socket connected).
  useEffect(() => {
    let cancelled = false;
    getQueue()
      .then((res) => {
        if (cancelled) return;
        const map: Record<string, QueueJob> = {};
        (res.data || []).forEach((j) => {
          map[j.id] = {
            job_id: j.id,
            capture_id: j.capture_id,
            stage: j.current_stage,
            progress: j.progress_percent,
          };
        });
        setJobs(map);
      })
      .catch(() => {
        // Leave the list empty; the parent UploadsTable/UploadStats
        // components already surface backend connectivity errors.
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  // Live updates pushed over the websocket as the worker processes jobs.
  useEffect(() => {
    setJobs((prev) => {
      const merged = { ...prev };
      Object.values(liveJobs).forEach((ev) => {
        if (TERMINAL_STAGES.has(ev.stage)) {
          delete merged[ev.job_id];
        } else {
          merged[ev.job_id] = ev;
        }
      });
      return merged;
    });
  }, [liveJobs]);

  const activeJobs = Object.values(jobs);

  return (
    <div className="bg-[#111218] border border-gray-800 rounded-xl flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-semibold text-gray-200">Processing Queue</h3>
        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full font-medium">
          {activeJobs.length} active
        </span>
      </div>

      {activeJobs.length === 0 ? (
        <div className="p-6 flex-1 flex items-center justify-center text-gray-500 text-sm">
          No active jobs in the queue
        </div>
      ) : (
        <div className="p-4 space-y-3">
          {activeJobs.map((job) => (
            <div key={job.job_id} className="text-sm">
              <div className="flex justify-between text-gray-300 mb-1">
                <span>{job.stage}</span>
                <span className="text-gray-500">{job.progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 transition-all" style={{ width: `${job.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isConnected && activeJobs.length > 0 && (
        <p className="px-4 pb-3 text-xs text-yellow-500">
          Live updates disconnected - retrying...
        </p>
      )}
    </div>
  );
}
