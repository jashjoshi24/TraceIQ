import React from 'react';

export function UploadsTable() {
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
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                No uploads found
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
