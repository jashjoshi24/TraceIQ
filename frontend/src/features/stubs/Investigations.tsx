import React from 'react';
import { PermissionGuard } from '../../components/Guards';
import { FolderGit2, ShieldAlert } from 'lucide-react';

export const Investigations: React.FC = () => {
  const mockCases = [
    { id: 'CASE-1049', title: 'Suspicious Admin Password Reset', status: 'In Progress', severity: 'High' },
    { id: 'CASE-1048', title: 'Unusual Session Refresh Spikes', status: 'Investigating', severity: 'Medium' },
    { id: 'CASE-1047', title: 'Failed Authentication Burst from 192.168.1.45', status: 'Closed', severity: 'Low' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Incident Investigations</h1>
          <p className="page-subtitle">Track and resolve security incidents and case files</p>
        </div>
      </div>

      <PermissionGuard
        permission="view_cases"
        fallback={
          <div className="glass-card">
            <div className="alert alert-danger">
              <ShieldAlert size={18} />
              <span>Permission Denied: Requires `view_cases` permission to access Incident Case files.</span>
            </div>
          </div>
        }
      >
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Incident Description</th>
                <th>Severity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {mockCases.map((c) => (
                <tr key={c.id}>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>{c.id}</code>
                  </td>
                  <td style={{ fontWeight: 600 }}>{c.title}</td>
                  <td>
                    <span className={`badge ${c.severity === 'High' ? 'badge-rose' : 'badge-purple'}`}>
                      {c.severity}
                    </span>
                  </td>
                  <td>
                    <span className="badge badge-cyan">{c.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PermissionGuard>
    </div>
  );
};
