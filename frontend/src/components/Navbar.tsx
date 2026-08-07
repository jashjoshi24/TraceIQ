import React from 'react';
import { useAuthStore } from '../store/authStore';
import { ShieldCheck, User as UserIcon, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, roles } = useAuthStore();

  return (
    <header
      style={{
        height: '64px',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Active Mode / Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div className="badge badge-emerald">
          <ShieldCheck size={14} />
          <span>IAM Active Session</span>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          Environment: Local Dev (Port 8001)
        </span>
      </div>

      {/* Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
        <button
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.4rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
          }}
          title="Notifications"
        >
          <Bell size={18} />
        </button>

        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            color: 'var(--text-primary)',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.85rem',
              fontWeight: 700,
            }}
          >
            {user?.username?.charAt(0).toUpperCase() || <UserIcon size={16} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.2 }}>
              {user?.profile?.first_name ? `${user.profile.first_name} ${user.profile.last_name}` : user?.username}
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {roles[0] || 'Authenticated User'}
            </span>
          </div>
        </Link>
      </div>
    </header>
  );
};
