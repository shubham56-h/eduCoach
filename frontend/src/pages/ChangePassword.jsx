import React, { useState } from 'react';
import api from '../services/api';

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirm) return setError('New passwords do not match.');
    if (newPassword.length < 6) return setError('New password must be at least 6 characters.');
    if (currentPassword === newPassword) return setError('New password must be different from current password.');

    try {
      setIsLoading(true);
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.75rem 0.875rem',
    background: 'rgba(0,0,0,0.2)',
    border: '1px solid #334155',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <section>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2rem', margin: '0 0 0.5rem', color: '#fff' }}>Change Password</h2>
        <p style={{ color: 'var(--text-muted)' }}>Update your account password.</p>
      </div>

      {error && (
        <div className="error-message shake" style={{ marginBottom: '1.25rem', maxWidth: '480px' }}>{error}</div>
      )}
      {success && (
        <div style={{
          marginBottom: '1.25rem', padding: '0.875rem 1rem', maxWidth: '480px',
          background: 'rgba(16,185,129,0.1)', color: '#10b981',
          borderRadius: '6px', border: '1px solid rgba(16,185,129,0.25)',
        }}>{success}</div>
      )}

      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid #334155',
        borderRadius: '10px',
        padding: '2rem',
        maxWidth: '480px',
      }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 6 characters"
              required
              style={inputStyle}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', color: '#cbd5e1', fontSize: '0.875rem', fontWeight: '500' }}>
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat new password"
              required
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="login-button"
            style={{ marginTop: '0.5rem', opacity: isLoading ? 0.6 : 1, cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            {isLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </section>
  );
};

export default ChangePassword;
