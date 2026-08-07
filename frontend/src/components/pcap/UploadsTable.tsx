"use client";

import React, { useEffect, useState } from 'react';
import { CaptureRecord, getUploads } from '@/lib/api';
import { FileDetails } from './FileDetails';

function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

const STATUS_STYLES: Record<string, string> = {
  Completed: 'bg-green-500/20 text-green-400',
  Failed: 'bg-red-500/20 text-red-400',
  Cancelled: 'bg-gray-500/20 text-gray-400',
  Queued: 'bg-gray-500/20 text-gray-400',
};

export function UploadsTable({ refreshKey }: { refreshKey?: number }) {
  const [captures, setCaptures] = useState<CaptureRecord[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getUploads()
      .then((res) => {
        if (!cancelled) {
          setCaptures(res.data || []);
          setError(null);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  return (
    <div className="bg-[#111218] border border-gray-800 rounded-xl shadow-sm">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-semibold text-gray-200">Recent Uploads</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-400">
          <thead className="text-xs text-gray-500 uppercase bg-[#0b0c10]/50 border-b border-gray-800">
            <tr>
              <th className="px-4 py-3">Filename</th>
              <th className="px-4 py-3">Upload Date</th>
              <th className="px-4 py-3">Size</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {error ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-red-400">
                  {error}
                </td>
              </tr>
            ) : captures.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No uploads found
                </td>
              </tr>
            ) : (
              captures.map((c) => (
                <tr key={c.id} className="border-b border-gray-800/50 last:border-b-0">
                  <td className="px-4 py-3 text-gray-200">{c.original_filename}</td>
                  <td className="px-4 py-3">{new Date(c.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3">{formatBytes(c.size_bytes)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_STYLES[c.status] || 'bg-blue-500/20 text-blue-400'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setSelectedId(c.id)} className="text-blue-400 hover:text-blue-300">
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedId && <FileDetails captureId={selectedId} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
