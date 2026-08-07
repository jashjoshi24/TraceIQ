import React from 'react';
import { AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const ThreatCenter: React.FC = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Threat Center Intelligence</h1>
          <p className="page-subtitle">Real-time threat feed monitoring and anomaly detection</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>HIGH SEVERITY ALERTS</span>
            <AlertTriangle size={20} style={{ color: 'var(--accent-rose)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>3 Active</div>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-rose)', display: 'block', marginTop: '0.4rem' }}>
            ● Potential Credential Spray Attempt
          </span>
        </div>

        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>DEFENSE WALL STATUS</span>
            <ShieldCheck size={20} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800 }}>100% Operational</div>
          <span style={{ fontSize: '0.85rem', color: 'var(--accent-emerald)', display: 'block', marginTop: '0.4rem' }}>
            ● IAM Guard Active
          </span>
        </div>
      </div>
    </div>
  );
};
