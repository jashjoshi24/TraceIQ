import React, { useEffect, useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { DataTable } from '../ui/DataTable';
import { fetcher } from '@/lib/api';

const SeverityBadge = ({ severity }: { severity: string }) => {
  const colors: Record<string, string> = {
    Critical: 'bg-red-500/20 text-red-400',
    High: 'bg-orange-500/20 text-orange-400',
    Medium: 'bg-yellow-500/20 text-yellow-400',
    Low: 'bg-blue-500/20 text-blue-400',
    Info: 'bg-gray-500/20 text-gray-400'
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[severity] || colors.Info}`}>
      {severity}
    </span>
  );
};

export const AlertsTableWidget = () => {
  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetcher(`/api/alerts?page=${pageIndex + 1}&size=${pageSize}`)
      .then(res => {
        setData(res.data);
        setPageCount(Math.ceil(res.total / pageSize));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pageIndex, pageSize]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'id', header: 'ID', cell: info => <span className="font-mono text-xs">{info.getValue() as string}</span> },
    { accessorKey: 'severity', header: 'Severity', cell: info => <SeverityBadge severity={info.getValue() as string} /> },
    { accessorKey: 'name', header: 'Alert Name' },
    { accessorKey: 'source_ip', header: 'Source IP', cell: info => <span className="font-mono text-gray-400">{info.getValue() as string}</span> },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'timestamp', header: 'Time', cell: info => new Date(info.getValue() as string).toLocaleTimeString() },
  ];

  return (
    <div className="bg-[#111218] border border-gray-800 rounded-lg flex flex-col h-[400px]">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-semibold text-gray-200">Recent Alerts</h3>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        pageCount={pageCount} 
        pageIndex={pageIndex} 
        pageSize={pageSize} 
        setPageIndex={setPageIndex} 
        setPageSize={setPageSize}
        loading={loading}
      />
    </div>
  );
};

export const IncidentsTableWidget = () => {
  const [data, setData] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetcher(`/api/incidents?page=${pageIndex + 1}&size=${pageSize}`)
      .then(res => {
        setData(res.data);
        setPageCount(Math.ceil(res.total / pageSize));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pageIndex, pageSize]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: 'id', header: 'ID', cell: info => <span className="font-mono text-xs text-blue-400">{info.getValue() as string}</span> },
    { accessorKey: 'severity', header: 'Severity', cell: info => <SeverityBadge severity={info.getValue() as string} /> },
    { accessorKey: 'name', header: 'Incident Name' },
    { accessorKey: 'assigned_to', header: 'Assignee' },
    { accessorKey: 'status', header: 'Status' },
  ];

  return (
    <div className="bg-[#111218] border border-gray-800 rounded-lg flex flex-col h-[400px]">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h3 className="font-semibold text-gray-200">Active Incidents</h3>
      </div>
      <DataTable 
        columns={columns} 
        data={data} 
        pageCount={pageCount} 
        pageIndex={pageIndex} 
        pageSize={pageSize} 
        setPageIndex={setPageIndex} 
        setPageSize={setPageSize}
        loading={loading}
      />
    </div>
  );
};
