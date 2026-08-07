import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../utils/api';
import { User, Phone, Building, KeyRound, Save, AlertCircle, CheckCircle2, Shield, LogOut, Users, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, roles, logout, updateProfileState, hasRole } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [avatar, setAvatar] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const primaryRole = roles[0] || 'User';

  useEffect(() => {
    if (user?.profile) {
      setFirstName(user.profile.first_name || '');
      setLastName(user.profile.last_name || '');
      setPhone(user.profile.phone || '');
      setDepartment(user.profile.department || '');
      setAvatar(user.profile.avatar || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    setIsSavingProfile(true);

    try {
      await api.put('/users/profile', {
        first_name: firstName,
        last_name: lastName,
        phone,
        department,
        avatar,
      });

      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });

      const meRes = await api.get('/auth/me');
      updateProfileState(meRes.data);
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail || 'Failed to update profile.';
      setProfileMsg({ type: 'danger', text: errorDetail });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'danger', text: 'New passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'danger', text: 'New password must be at least 6 characters' });
      return;
    }

    setIsSavingPassword(true);

    try {
      await api.put('/users/change-password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const errorDetail = err.response?.data?.detail || 'Failed to change password. Please check your current password.';
      setPasswordMsg({ type: 'danger', text: errorDetail });
    } finally {
      setIsSavingPassword(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Top Header: Auth Session Bar */}
      <div
        className="glass-card"
        style={{
          padding: '1.2rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            <Shield size={22} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', lineHeight: 1.2 }}>
              Trace<span style={{ color: 'var(--accent-cyan)' }}>IQ</span> IAM Authentication Session
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.2rem' }}>
              <span className="badge badge-emerald" style={{ fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                <ShieldCheck size={12} />
                <span>AUTHENTICATED</span>
              </span>
              <span className="badge badge-purple" style={{ fontSize: '0.65rem' }}>
                Role: {primaryRole}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {hasRole('Admin') && (
            <>
              <Link to="/users" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                <Users size={16} />
                <span>User Directory</span>
              </Link>
              <Link to="/roles" className="btn btn-secondary" style={{ fontSize: '0.85rem' }}>
                <KeyRound size={16} />
                <span>Roles Matrix</span>
              </Link>
            </>
          )}

          <button onClick={logout} className="btn btn-secondary" style={{ color: 'var(--accent-rose)', fontSize: '0.85rem' }}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main Profile & Password Settings Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
        {/* Personal Information Form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <User size={20} style={{ color: 'var(--accent-cyan)' }} />
            <span>Personal Information</span>
          </h3>

          {profileMsg && (
            <div className={`alert alert-${profileMsg.type}`}>
              {profileMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdateProfile}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="John"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Username (Read-only)</label>
              <input type="text" className="form-input" value={user?.username || ''} disabled readOnly style={{ opacity: 0.7 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input type="text" className="form-input" value={user?.email || ''} disabled readOnly style={{ opacity: 0.7 }} />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1-555-0199"
                />
                <Phone size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Department / Operations Unit</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Global Security Operations Center"
                />
                <Building size={18} style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={isSavingProfile}>
              <Save size={16} />
              <span>{isSavingProfile ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <KeyRound size={20} style={{ color: 'var(--accent-purple)' }} />
            <span>Change Password</span>
          </h3>

          {passwordMsg && (
            <div className={`alert alert-${passwordMsg.type}`}>
              {passwordMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1.5rem' }} disabled={isSavingPassword}>
              <Shield size={16} />
              <span>{isSavingPassword ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
