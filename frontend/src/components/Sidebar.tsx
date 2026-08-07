import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  Shield,
  Users,
  KeyRound,
  UserCheck,
  LogOut,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, roles, logout, hasRole, hasPermission } = useAuthStore();

  const primaryRole = roles[0] || 'User';

  const navItems = [
    {
      label: 'My Profile & Settings',
      path: '/profile',
      icon: UserCheck,
      show: true,
    },
    {
      label: 'Users Directory',
      path: '/users',
      icon: Users,
      show: hasRole('Admin') || hasPermission('manage_users'),
    },
    {
      label: 'Roles & Permissions',
      path: '/roles',
      icon: KeyRound,
      show: hasRole('Admin') || hasPermission('manage_users'),
    },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 1rem',
        minHeight: '100vh',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingBottom: '1.5rem',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-sm)',
            background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          <Shield size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'white' }}>
            Trace<span style={{ color: 'var(--accent-cyan)' }}>IQ</span>
          </h1>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Module 1: Auth & RBAC
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        {navItems
          .filter((item) => item.show)
          .map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.7rem 0.9rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: isActive ? 'var(--accent-cyan)' : 'var(--text-secondary)',
                  backgroundColor: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                  transition: 'all 0.2s ease',
                })}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
      </nav>

      {/* User Card & Logout */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        <NavLink
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-hover)',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
            }}
          >
            {user?.username?.charAt(0).toUpperCase() || <UserCheck size={18} />}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div
              style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.username}
            </div>
            <span
              className={`badge ${
                primaryRole === 'Admin'
                  ? 'badge-rose'
                  : primaryRole === 'SOC Analyst'
                  ? 'badge-cyan'
                  : 'badge-purple'
              }`}
              style={{ fontSize: '0.65rem' }}
            >
              {primaryRole}
            </span>
          </div>
        </NavLink>

        <button
          onClick={logout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-rose)' }}
        >
          <LogOut size={16} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};
