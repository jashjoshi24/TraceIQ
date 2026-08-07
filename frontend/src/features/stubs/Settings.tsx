import React from 'react';
import { RoleGuard } from '../../components/Guards';
import { Settings as SettingsIcon, Sliders, ShieldCheck } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">System Settings & Security Policy</h1>
          <p className="page-subtitle">Configure token lifetimes, rotation policies, and global authentication guards</p>
        </div>
      </div>

      <RoleGuard allowedRoles={['Admin']}>
        <div className="glass-card" style={{ maxWidth: '600px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Sliders size={22} style={{ color: 'var(--accent-cyan)' }} />
            <span>JWT Security Policy Configuration</span>
          </h3>

          <div className="form-group">
            <label className="form-label">Access Token Expiry (Minutes)</label>
            <input type="number" className="form-input" defaultValue={15} readOnly style={{ opacity: 0.8 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Refresh Token Expiry (Days)</label>
            <input type="number" className="form-input" defaultValue={7} readOnly style={{ opacity: 0.8 }} />
          </div>

          <div className="form-group">
            <label className="form-label">Refresh Token Strategy</label>
            <input type="text" className="form-input" defaultValue="Rotation Enabled + Theft Revocation" readOnly style={{ opacity: 0.8 }} />
          </div>

          <div className="badge badge-emerald" style={{ marginTop: '0.5rem' }}>
            <ShieldCheck size={14} />
            <span>All System Enforcements Active</span>
          </div>
        </div>
      </RoleGuard>
    </div>
  );
};
