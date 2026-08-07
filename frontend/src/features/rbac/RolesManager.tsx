import React, { useState, useEffect } from 'react';
import { api } from '../../utils/api';
import { Role, Permission } from '../../types/auth';
import { Modal } from '../../components/Modal';
import { KeyRound, Shield, Plus, Edit2, Trash2, CheckCircle2, Lock, AlertCircle } from 'lucide-react';

export const RolesManager: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleName, setRoleName] = useState('');
  const [roleDesc, setRoleDesc] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const fetchRbacData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        api.get('/roles'),
        api.get('/permissions'),
      ]);
      setRoles(rolesRes.data);
      setPermissions(permsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load RBAC data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRbacData();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setRoleName('');
    setRoleDesc('');
    setSelectedPerms([]);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (role: Role) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDesc(role.description || '');
    setSelectedPerms(role.permissions.map((p) => p.name));
    setIsModalOpen(true);
  };

  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    try {
      if (editingRole) {
        // Edit existing role
        await api.put(`/roles/${editingRole.id}`, {
          name: roleName,
          description: roleDesc,
          permissions: selectedPerms,
        });
      } else {
        // Create new role
        await api.post('/roles', {
          name: roleName,
          description: roleDesc,
          permissions: selectedPerms,
        });
      }
      setIsModalOpen(false);
      fetchRbacData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to save role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await api.delete(`/roles/${roleId}`);
      fetchRbacData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to delete role');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="page-header">
        <div>
          <h1 className="page-title">Role & Permission Control Center</h1>
          <p className="page-subtitle">Configure granular system roles, access policies, and permission mappings</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenCreateModal}>
          <Plus size={18} />
          <span>Create New Role</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Role Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        {roles.map((role) => {
          const rolePermNames = role.permissions.map((p) => p.name);
          return (
            <div key={role.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{role.name}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{role.description || 'No description provided.'}</p>
                </div>
                <span className={`badge ${role.name === 'Admin' ? 'badge-rose' : 'badge-cyan'}`}>{role.permissions.length} Perms</span>
              </div>

              <div style={{ margin: '1rem 0', flex: 1 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.6rem' }}>
                  GRANTED PERMISSIONS:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {role.permissions.length === 0 ? (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No permissions bound</span>
                  ) : (
                    role.permissions.map((p) => (
                      <span key={p.id} className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                        {p.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} onClick={() => handleOpenEditModal(role)}>
                  <Edit2 size={14} />
                  <span>Edit Policy</span>
                </button>
                {role.name !== 'Admin' && (
                  <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }} onClick={() => handleDeleteRole(role.id)}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Permissions Catalogue Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Lock size={20} style={{ color: 'var(--accent-emerald)' }} />
          <span>System Permissions Directory</span>
        </h3>

        <table className="data-table">
          <thead>
            <tr>
              <th>Permission Token</th>
              <th>Description</th>
              <th>Granted Roles</th>
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => {
              const holdingRoles = roles.filter((r) => r.permissions.some((p) => p.name === perm.name));
              return (
                <tr key={perm.id}>
                  <td>
                    <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>{perm.name}</code>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{perm.description}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {holdingRoles.map((r) => (
                        <span key={r.id} className="badge badge-cyan" style={{ fontSize: '0.65rem' }}>
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Role Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRole ? `Edit Role: ${editingRole.name}` : 'Create New System Role'}>
        <form onSubmit={handleSaveRole}>
          <div className="form-group">
            <label className="form-label">Role Name</label>
            <input
              type="text"
              className="form-input"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="e.g. Incident Response Lead"
              required
              disabled={editingRole?.name === 'Admin'}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <input
              type="text"
              className="form-input"
              value={roleDesc}
              onChange={(e) => setRoleDesc(e.target.value)}
              placeholder="Short summary of role scope"
            />
          </div>

          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label className="form-label">Select Permissions</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '220px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {permissions.map((p) => {
                const isChecked = selectedPerms.includes(p.name);
                return (
                  <label
                    key={p.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.6rem 0.8rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-hover)',
                      border: `1px solid ${isChecked ? 'var(--accent-emerald)' : 'var(--border-color)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    <div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{p.description}</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPerms([...selectedPerms, p.name]);
                        } else {
                          setSelectedPerms(selectedPerms.filter((name) => name !== p.name));
                        }
                      }}
                      style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Role Definition
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
