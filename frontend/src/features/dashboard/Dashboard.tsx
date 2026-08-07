import React, { useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { PermissionGuard } from '../../components/Guards';
import { api } from '../../utils/api';
import {
  Shield,
  ShieldCheck,
  Key,
  Users,
  Lock,
  ArrowUpRight,
  RefreshCw,
  UserCheck,
  BadgeCheck,
  CheckCircle2,
  Clock,
  KeyRound,
  FileCheck2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user, roles, permissions, setAccessToken } = useAuthStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const primaryRole = roles[0] || 'User';

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      const response = await api.post('/auth/refresh');
      setAccessToken(response.data.access_token);
      setRefreshMessage('✓ Access Token refreshed successfully via HttpOnly cookie!');
    } catch {
      setRefreshMessage('❌ Silent refresh failed. Session may have expired.');
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Top Banner: TraceIQ IAM Module 1 Control Hub */}
      <div
        className="glass-card"
        style={{
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.8))',
          borderLeft: '4px solid var(--accent-cyan)',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'white' }}>
                Trace<span style={{ color: 'var(--accent-cyan)' }}>IQ</span> IAM & RBAC Control Hub
              </h2>
              <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <BadgeCheck size={14} />
                <span>AUTHENTICATED SESSION</span>
              </span>
              <span
                className={`badge ${
                  primaryRole === 'Admin'
                    ? 'badge-rose'
                    : primaryRole === 'SOC Analyst'
                    ? 'badge-cyan'
                    : 'badge-purple'
                }`}
              >
                Role: {primaryRole}
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Welcome back, <strong style={{ color: 'var(--text-primary)' }}>{user?.username}</strong> ({user?.email}) •{' '}
              {user?.profile?.department ? `Department: ${user.profile.department} • ` : ''}
              Identity Session Active
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/profile" className="btn btn-secondary">
              <UserCheck size={16} />
              <span>Edit Profile</span>
            </Link>
            <PermissionGuard permission="manage_users">
              <Link to="/users" className="btn btn-primary">
                <Users size={16} />
                <span>Users Directory</span>
              </Link>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Identity & Session Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Metric 1: Identity Status */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              IDENTITY STATUS
            </span>
            <ShieldCheck size={22} style={{ color: 'var(--accent-emerald)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {user?.username}
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <CheckCircle2 size={14} />
            <span>Account Active & Verified</span>
          </div>
        </div>

        {/* Metric 2: JWT Access Session */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              JWT ACCESS SESSION
            </span>
            <Clock size={22} style={{ color: 'var(--accent-cyan)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            15 <span style={{ fontSize: '1rem', color: 'var(--accent-cyan)' }}>Minutes</span>
          </div>
          <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Rotation-enabled Refresh Token Active
          </div>
        </div>

        {/* Metric 3: Assigned System Roles */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              ASSIGNED ROLES
            </span>
            <Users size={22} style={{ color: 'var(--accent-purple)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {roles.length} <span style={{ fontSize: '1rem', color: 'var(--accent-purple)' }}>{roles.length === 1 ? 'Role' : 'Roles'}</span>
          </div>
          <span className="badge badge-purple" style={{ marginTop: '0.5rem', fontSize: '0.7rem' }}>
            {roles.join(' • ') || 'None'}
          </span>
        </div>

        {/* Metric 4: Granted Permissions */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>
              GRANTED PERMISSIONS
            </span>
            <Key size={22} style={{ color: 'var(--accent-amber)' }} />
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
            {permissions.length} <span style={{ fontSize: '1rem', color: 'var(--accent-amber)' }}>Tokens</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', display: 'block' }}>
            Union set across assigned roles
          </span>
        </div>
      </div>

      {/* Main Content Split: JWT Token Operations + IAM Management Links */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* JWT Token & Session Operations */}
        <div className="glass-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield size={20} style={{ color: 'var(--accent-cyan)' }} />
              <span>JWT Session Security Control</span>
            </h3>
            <span className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>SHORT-LIVED JWT</span>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
            Your session is secured using short-lived JWT Access Tokens and a rotation-enabled HttpOnly Refresh Token cookie.
          </p>

          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="btn btn-secondary"
            style={{ width: '100%', padding: '0.8rem', justifyContent: 'center' }}
          >
            <RefreshCw size={16} className={isRefreshing ? 'spin' : ''} />
            <span>{isRefreshing ? 'Refreshing Access Token...' : 'Test Silent Token Refresh (/auth/refresh)'}</span>
          </button>

          {refreshMessage && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: refreshMessage.startsWith('✓') ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                border: `1px solid ${refreshMessage.startsWith('✓') ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                color: refreshMessage.startsWith('✓') ? 'var(--accent-emerald)' : 'var(--accent-rose)',
                fontSize: '0.85rem',
              }}
            >
              {refreshMessage}
            </div>
          )}
        </div>

        {/* Permitted IAM Management Links */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} style={{ color: 'var(--accent-purple)' }} />
            <span>IAM Module 1 Quick Access</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <Link
              to="/profile"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem 1rem',
                backgroundColor: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--text-primary)',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <UserCheck size={18} style={{ color: 'var(--accent-cyan)' }} />
                <span>My Profile & Password Settings</span>
              </div>
              <ArrowUpRight size={18} />
            </Link>

            <PermissionGuard
              permission="manage_users"
              fallback={
                <div style={{ opacity: 0.5, padding: '0.8rem 1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🔒 User Directory (Requires `manage_users` permission or Admin role)</span>
                </div>
              }
            >
              <Link
                to="/users"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(16, 185, 129, 0.08)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Users size={18} style={{ color: 'var(--accent-emerald)' }} />
                  <span>User Accounts Directory & Search</span>
                </div>
                <ArrowUpRight size={18} />
              </Link>
            </PermissionGuard>

            <PermissionGuard
              permission="manage_users"
              fallback={
                <div style={{ opacity: 0.5, padding: '0.8rem 1rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>🔒 Roles & Permissions Matrix (Requires Admin role)</span>
                </div>
              }
            >
              <Link
                to="/roles"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'rgba(139, 92, 246, 0.08)',
                  border: '1px solid rgba(139, 92, 246, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <KeyRound size={18} style={{ color: 'var(--accent-purple)' }} />
                  <span>RBAC Roles & Permissions Matrix</span>
                </div>
                <ArrowUpRight size={18} />
              </Link>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Permissions Matrix Overview */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={18} style={{ color: 'var(--accent-emerald)' }} />
          <span>Active Role Permissions Matrix</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {[
            { token: 'view_dashboard', label: 'View Dashboard & IAM Overview' },
            { token: 'manage_users', label: 'Administer Users & Roles' },
            { token: 'upload_pcap', label: 'Upload & Parse Security Files' },
            { token: 'view_cases', label: 'Access Incident Records' },
            { token: 'view_reports', label: 'Export System Reports' },
          ].map((p) => {
            const isGranted = permissions.includes(p.token);
            return (
              <div
                key={p.token}
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isGranted ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.4)',
                  border: `1px solid ${isGranted ? 'rgba(16, 185, 129, 0.25)' : 'rgba(51, 65, 85, 0.4)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: isGranted ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {p.label}
                  </div>
                  <code style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{p.token}</code>
                </div>
                <span className={`badge ${isGranted ? 'badge-emerald' : 'badge-rose'}`}>
                  {isGranted ? 'Granted' : 'Locked'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
