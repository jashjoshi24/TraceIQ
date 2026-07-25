import React from 'react';

export function FileDetails({ captureId, onClose }: { captureId: string, onClose: () => void }) {
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
          <p className="text-gray-400">Loading details for {captureId}...</p>
        </div>
      </div>
    </div>
  );
}
