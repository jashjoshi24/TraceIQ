"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { Forbidden } from '../features/common/Forbidden';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Next.js App Router equivalent of the original react-router ProtectedRoute:
// no <Navigate>/<Outlet> here (those are react-router-only), so an
// unauthenticated user is redirected via useRouter() inside an effect, and
// children are rendered directly by whatever layout/page wraps them.
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isHydrated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isHydrated, isAuthenticated, router]);

  if (!isHydrated || isLoading || !isAuthenticated) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--bg-primary)',
          color: 'var(--accent-cyan)',
          gap: '1rem',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(6, 182, 212, 0.2)',
            borderTopColor: 'var(--accent-cyan)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Authenticating TraceIQ session...</span>
      </div>
    );
  }

  return <>{children}</>;
};

interface RoleGuardProps {
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children, fallback }) => {
  const { hasAnyRole } = useAuthStore();

  if (!hasAnyRole(allowedRoles)) {
    return fallback ? <>{fallback}</> : <Forbidden />;
  }

  return <>{children}</>;
};

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissions = [],
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission } = useAuthStore();

  const requiredPerms = permission ? [permission, ...permissions] : permissions;
  const isAllowed = hasAnyPermission(requiredPerms);

  if (!isAllowed) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
};
