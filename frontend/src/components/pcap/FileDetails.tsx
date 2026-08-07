"use client";

import React, { useEffect, useState } from 'react';
import { CaptureRecord, getUploadDetail } from '@/lib/api';

export function FileDetails({ captureId, onClose }: { captureId: string; onClose: () => void }) {
  const [details, setDetails] = useState<CaptureRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setDetails(null);
    setError(null);
    getUploadDetail(captureId)
      .then((data) => {
        if (!cancelled) setDetails(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, [captureId]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex justify-end">
      <div className="w-[600px] h-full bg-[#111218] border-l border-gray-800 shadow-2xl flex flex-col">
        <div className="p-6 border-b border-gray-800 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-100">Capture Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-200">
            &times;
          </button>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          {error && <p className="text-red-400">{error}</p>}
          {!details && !error && <p className="text-gray-400">Loading details for {captureId}...</p>}
          {details && (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Filename</dt>
                <dd className="text-gray-200 text-right break-all">{details.original_filename}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Format</dt>
                <dd className="text-gray-200">{details.format}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Size</dt>
                <dd className="text-gray-200">{details.size_bytes.toLocaleString()} bytes</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">SHA-256</dt>
                <dd className="text-gray-200 text-right break-all">{details.sha256_hash}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Status</dt>
                <dd className="text-gray-200">{details.status}</dd>
              </div>
              {details.packet_count != null && (
                <div className="flex justify-between gap-4">
                  <dt className="text-gray-500">Packet Count</dt>
                  <dd className="text-gray-200">{details.packet_count.toLocaleString()}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Uploaded</dt>
                <dd className="text-gray-200">{new Date(details.created_at).toLocaleString()}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
}
