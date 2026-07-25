import React from 'react';

export function UploadZone() {
  return (
    <div className="border-2 border-dashed border-gray-700 bg-[#111218] rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-[#1a1c23] transition-colors">
      <div className="p-4 bg-blue-500/10 rounded-full mb-4">
        <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-200">Drag and drop PCAP/PCAPNG files</h3>
      <p className="text-sm text-gray-500 mt-2">or click to browse from your computer</p>
    </div>
  );
}
