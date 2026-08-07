"use client";

import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { uploadPcapFile } from '@/lib/api';

export interface UploadZoneHandle {
  openFileDialog: () => void;
}

interface UploadZoneProps {
  onUploadSuccess?: () => void;
}

interface UploadItem {
  id: string;
  name: string;
  progress: number;
  status: 'uploading' | 'done' | 'error';
  error?: string;
}

const ALLOWED_EXTENSIONS = ['.pcap', '.pcapng'];

function isAllowedFile(name: string): boolean {
  const lower = name.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export const UploadZone = forwardRef<UploadZoneHandle, UploadZoneProps>(function UploadZone(
  { onUploadSuccess },
  ref
) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploads, setUploads] = useState<UploadItem[]>([]);

  useImperativeHandle(ref, () => ({
    openFileDialog: () => inputRef.current?.click(),
  }));

  const handleFiles = useCallback(
    (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      Array.from(fileList).forEach((file) => {
        const itemId = `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

        if (!isAllowedFile(file.name)) {
          setUploads((prev) => [
            ...prev,
            {
              id: itemId,
              name: file.name,
              progress: 0,
              status: 'error',
              error: 'Only .pcap or .pcapng files are allowed.',
            },
          ]);
          return;
        }

        setUploads((prev) => [...prev, { id: itemId, name: file.name, progress: 0, status: 'uploading' }]);

        uploadPcapFile(file, (percent) => {
          setUploads((prev) => prev.map((u) => (u.id === itemId ? { ...u, progress: percent } : u)));
        })
          .then(() => {
            setUploads((prev) => prev.map((u) => (u.id === itemId ? { ...u, progress: 100, status: 'done' } : u)));
            onUploadSuccess?.();
          })
          .catch((err: Error) => {
            setUploads((prev) =>
              prev.map((u) => (u.id === itemId ? { ...u, status: 'error', error: err.message } : u))
            );
          });
      });
    },
    [onUploadSuccess]
  );

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-[#1a1c23]' : 'border-gray-700 bg-[#111218] hover:border-blue-500 hover:bg-[#1a1c23]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pcap,.pcapng"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            // Allow re-selecting the same file again later.
            e.target.value = '';
          }}
        />
        <div className="p-4 bg-blue-500/10 rounded-full mb-4">
          <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-200">Drag and drop PCAP/PCAPNG files</h3>
        <p className="text-sm text-gray-500 mt-2">or click to browse from your computer</p>
      </div>

      {uploads.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploads.map((u) => (
            <div key={u.id} className="bg-[#111218] border border-gray-800 rounded-lg p-3 text-sm">
              <div className="flex justify-between text-gray-300 mb-1">
                <span className="truncate max-w-[70%]">{u.name}</span>
                <span className={u.status === 'error' ? 'text-red-400' : 'text-gray-500'}>
                  {u.status === 'error' ? 'Failed' : u.status === 'done' ? 'Uploaded' : `${u.progress}%`}
                </span>
              </div>
              {u.status !== 'error' ? (
                <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${u.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`}
                    style={{ width: `${u.progress}%` }}
                  />
                </div>
              ) : (
                <p className="text-xs text-red-400">{u.error}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
