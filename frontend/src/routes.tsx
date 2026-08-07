import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ProtectedRoute, RoleGuard } from './components/Guards';

// Auth Pages (Module 1 Only)
import { Login } from './features/auth/Login';
import { Register } from './features/auth/Register';
import { ForgotPassword } from './features/auth/ForgotPassword';
import { ResetPassword } from './features/auth/ResetPassword';

// User & RBAC Pages (Module 1 Only)
import { Profile } from './features/users/Profile';
import { UsersList } from './features/users/UsersList';
import { RolesManager } from './features/rbac/RolesManager';

// Common Error Pages
import { Forbidden } from './features/common/Forbidden';
import { NotFound } from './features/common/NotFound';

// Pure Layout Container (No Sidebar, No Navbar, No Dashboard)
const AppLayout: React.FC = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)' }}>
      <main style={{ padding: '1.5rem 2rem' }}>
        <Outlet />
      </main>
    </div>
  );
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Module 1 Routes (Strictly Auth & Profile/RBAC) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/profile" replace />} />
          <Route path="/profile" element={<Profile />} />

          {/* Admin / User Manager Protected Routes */}
          <Route
            path="/users"
            element={
              <RoleGuard allowedRoles={['Admin']}>
                <UsersList />
              </RoleGuard>
            }
          />
          <Route
            path="/roles"
            element={
              <RoleGuard allowedRoles={['Admin']}>
                <RolesManager />
              </RoleGuard>
            }
          />

          {/* Error Pages */}
          <Route path="/403" element={<Forbidden />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};
