import React from 'react';

export function UploadStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {[
        { label: "Total Uploads", value: "0" },
        { label: "Active Jobs", value: "0" },
        { label: "Completed", value: "0" },
        { label: "Failed", value: "0" }
      ].map((stat, i) => (
        <div key={i} className="bg-[#111218] border border-gray-800 rounded-xl p-5 shadow-sm">
          <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
          <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
