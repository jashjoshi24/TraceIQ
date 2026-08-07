import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <div className="glass-card" style={{ maxWidth: '440px', textAlign: 'center', padding: '2.5rem 2rem' }}>
        <FileQuestion size={48} style={{ color: 'var(--accent-cyan)', marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          404 Page Not Found
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          The path you are looking for does not exist or has been moved.
        </p>

        <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%' }}>
          <ArrowLeft size={16} />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    </div>
  );
};
