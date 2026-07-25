import React from 'react';

export function ProcessingQueue() {
  return (
    <div className="bg-[#111218] border border-gray-800 rounded-xl flex flex-col h-full shadow-sm">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-semibold text-gray-200">Processing Queue</h3>
        <span className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded-full font-medium">0 active</span>
      </div>
      <div className="p-6 flex-1 flex items-center justify-center text-gray-500 text-sm">
        No active jobs in the queue
      </div>
    </div>
  );
}
