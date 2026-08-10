"use client";

import React, { useCallback, useRef, useState } from 'react';
import { UploadZone, UploadZoneHandle } from '@/components/pcap/UploadZone';
import { UploadStats } from '@/components/pcap/UploadStats';
import { ProcessingQueue } from '@/components/pcap/ProcessingQueue';
import { UploadsTable } from '@/components/pcap/UploadsTable';

export default function PCAPManagerPage() {
  const uploadZoneRef = useRef<UploadZoneHandle>(null);
  // Bumping this forces UploadStats / UploadsTable / ProcessingQueue to
  // re-fetch after a successful upload, without needing a global store.
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = useCallback(() => {
    setRefreshKey((k) => k + 1);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-100">PCAP Manager</h2>
          <p className="text-sm text-gray-500 mt-1">Upload and process network capture evidence</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => uploadZoneRef.current?.openFileDialog()}
            className="px-4 py-2 bg-blue-600 rounded-md text-sm hover:bg-blue-700 transition-colors text-white font-medium shadow-lg shadow-blue-500/20"
          >
            Upload Evidence
          </button>
        </div>
      </div>

      <UploadStats refreshKey={refreshKey} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <UploadZone ref={uploadZoneRef} onUploadSuccess={handleUploadSuccess} />
          <UploadsTable refreshKey={refreshKey} />
        </div>
        <div>
          <ProcessingQueue refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}
