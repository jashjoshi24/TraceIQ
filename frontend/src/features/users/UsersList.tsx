import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { User, Role } from '../../types/auth';
import { Modal } from '../../components/Modal';
import {
  Users as UsersIcon,
  Search,
  UserCheck,
  UserX,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
} from 'lucide-react';

export const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('username');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [loading, setLoading] = useState(false);

  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [selectedUserForRole, setSelectedUserForRole] = useState<User | null>(null);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users', {
        params: {
          page,
          limit,
          search: search || undefined,
          sort_by: sortBy,
          sort_order: sortOrder,
        },
      });
      setUsers(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await api.get('/roles');
      setAllRoles(res.data);
    } catch (err) {
      console.error('Failed to fetch roles', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, sortBy, sortOrder]);

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleToggleActive = async (targetUser: User) => {
    try {
      await api.put(`/users/${targetUser.id}`, {
        is_active: !targetUser.is_active,
      });
      fetchUsers();
    } catch (err) {
      console.error('Failed to update user active status', err);
    }
  };

  const handleOpenRoleModal = (user: User) => {
    setSelectedUserForRole(user);
    setSelectedRoles(user.roles.map((r) => r.name));
    setIsRoleModalOpen(true);
  };

  const handleAssignRoles = async () => {
    if (!selectedUserForRole) return;
    try {
      await api.post(`/users/${selectedUserForRole.id}/roles`, {
        role_names: selectedRoles,
      });
      setIsRoleModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Failed to assign roles', err);
    }
  };

  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">User Directory & IAM Administration</h1>
          <p className="page-subtitle">Manage system identities, role assignments, and account activation states</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              style={{ width: '100%', paddingLeft: '2.5rem' }}
              placeholder="Search by username, email, or department..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <Search size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>

          {/* Sort Controls */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Filter size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              className="form-input"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ padding: '0.5rem 0.8rem', cursor: 'pointer' }}
            >
              <option value="username">Sort by Username</option>
              <option value="email">Sort by Email</option>
              <option value="department">Sort by Department</option>
              <option value="created_at">Sort by Date Joined</option>
            </select>

            <select
              className="form-input"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              style={{ padding: '0.5rem 0.8rem', cursor: 'pointer' }}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>User Identity</th>
              <th>Department</th>
              <th>Assigned Roles</th>
              <th>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Loading user records...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No users found matching query.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '50%',
                          backgroundColor: 'rgba(6, 182, 212, 0.15)',
                          color: 'var(--accent-cyan)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                        }}
                      >
                        {u.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{u.username}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {u.profile?.department || 'Unassigned'}
                    </span>
                  </td>

                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {u.roles.length === 0 ? (
                        <span className="badge badge-purple" style={{ opacity: 0.6 }}>
                          No Roles
                        </span>
                      ) : (
                        u.roles.map((r) => (
                          <span
                            key={r.id}
                            className={`badge ${
                              r.name === 'Admin'
                                ? 'badge-rose'
                                : r.name === 'SOC Analyst'
                                ? 'badge-cyan'
                                : 'badge-purple'
                            }`}
                          >
                            {r.name}
                          </span>
                        ))
                      )}
                    </div>
                  </td>

                  <td>
                    <span className={`badge ${u.is_active ? 'badge-emerald' : 'badge-rose'}`}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleOpenRoleModal(u)}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.7rem' }}
                      >
                        Edit Roles
                      </button>

                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`btn ${u.is_active ? 'btn-danger' : 'btn-primary'}`}
                        style={{ fontSize: '0.8rem', padding: '0.4rem 0.7rem' }}
                      >
                        {u.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 1.5rem',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Showing {users.length > 0 ? (page - 1) * limit + 1 : 0} to {Math.min(page * limit, total)} of {total} users
          </span>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.6rem' }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.6rem' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Role Assignment Modal */}
      <Modal isOpen={isRoleModalOpen} onClose={() => setIsRoleModalOpen(false)} title={`Assign Roles: ${selectedUserForRole?.username}`}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.2rem' }}>
          Select the roles to grant to this user. Their permissions will be automatically computed from the union set of selected roles.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {allRoles.map((role) => {
            const isChecked = selectedRoles.includes(role.name);
            return (
              <label
                key={role.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.8rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isChecked ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-hover)',
                  border: `1px solid ${isChecked ? 'var(--accent-cyan)' : 'var(--border-color)'}`,
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{role.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{role.description}</div>
                </div>

                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedRoles([...selectedRoles, role.name]);
                    } else {
                      setSelectedRoles(selectedRoles.filter((r) => r !== role.name));
                    }
                  }}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>
            );
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setIsRoleModalOpen(false)}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleAssignRoles}>
            Save Role Assignment
          </button>
        </div>
      </Modal>
    </div>
  );
};
