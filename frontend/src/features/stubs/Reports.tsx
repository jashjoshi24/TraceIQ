import React from 'react';
import { PermissionGuard } from '../../components/Guards';
import { FileCheck2, Download, ShieldAlert } from 'lucide-react';

export const Reports: React.FC = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Compliance & Security Reports</h1>
          <p className="page-subtitle">Generate system audit logs and RBAC access compliance reports</p>
        </div>
      </div>

      <PermissionGuard
        permission="view_reports"
        fallback={
          <div className="glass-card">
            <div className="alert alert-danger">
              <ShieldAlert size={18} />
              <span>Permission Denied: Requires `view_reports` permission to generate reports.</span>
            </div>
          </div>
        }
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          <div className="glass-card">
            <FileCheck2 size={32} style={{ color: 'var(--accent-purple)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>IAM Access Audit Report</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem 0' }}>
              Full report on active user permissions, role changes, and token rotation logs.
            </p>
            <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => alert('Report download initiated.')}>
              <Download size={16} />
              <span>Export PDF Report</span>
            </button>
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
};
