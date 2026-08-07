import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';

export const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      navigate('/login');
    }, 1500);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        backgroundColor: 'var(--bg-primary)',
      }}
    >
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-emerald))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              marginBottom: '1rem',
            }}
          >
            <ShieldCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Set New Password
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.3rem' }}>
            Choose a new secure password for your account
          </p>
        </div>

        <div className="glass-card" style={{ padding: '2rem' }}>
          {error && <div className="alert alert-danger">{error}</div>}
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <CheckCircle2 size={48} style={{ color: 'var(--accent-emerald)', marginBottom: '1rem' }} />
              <h4 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Password Updated</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                Redirecting to login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="new-pass">
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-pass"
                    type="password"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="new-pass-confirm">
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    id="new-pass-confirm"
                    type="password"
                    className="form-input"
                    style={{ width: '100%', paddingLeft: '2.5rem' }}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <Lock
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '0.8rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'var(--text-muted)',
                    }}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
