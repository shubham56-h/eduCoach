import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setResetUrl('');

    try {
      const res = await api.post('/auth/forgot-password', { email });
      setResetUrl(res.data.resetUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-logo"></div>
          <h2>Forgot Password</h2>
          <p>Enter your email to get a reset link</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {resetUrl ? (
          <div style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#34d399',
            padding: '1.25rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}>
            <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
              Reset link generated. Click below to reset your password.
            </p>
            <Link
              to={resetUrl.replace('http://localhost:5173', '')}
              style={{
                display: 'inline-block',
                padding: '0.6rem 1.25rem',
                background: '#6366f1',
                color: '#fff',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.9rem',
                marginBottom: '1rem',
              }}
            >
              Reset Password
            </Link>
            <br />
            <Link to="/login" className="forgot-password">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="form-control"
              />
            </div>

            <button
              type="submit"
              className={`login-button ${isLoading ? 'loading' : ''}`}
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Get Reset Link'}
            </button>

            <div className="form-actions" style={{ justifyContent: 'center', marginTop: '1.25rem', marginBottom: 0 }}>
              <Link to="/login" className="forgot-password">Back to Login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
