import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';
import Logo from '../components/Logo';

const Login = () => {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [error, setError]               = useState(null);
  const [isLoading, setIsLoading]       = useState(false);
  const [isSuccess, setIsSuccess]       = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setInvalidFields([]);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, role, name } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      if (name) localStorage.setItem('name', name);

      setIsSuccess(true);

      setTimeout(() => {
        switch (role) {
          case 'student': navigate('/student/dashboard'); break;
          case 'faculty': navigate('/faculty/dashboard'); break;
          case 'admin':   navigate('/admin/dashboard');   break;
          default:        navigate('/');
        }
      }, 1500);

    } catch (err) {
      setInvalidFields(['email', 'password']);
      if (!err.response) {
        setError('Network error: unable to connect to the server.');
      } else {
        setError(err.response.data?.message || 'Invalid email or password.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {!isSuccess && (
          <div style={{ marginBottom: '1rem' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
              &larr; Back to Home
            </Link>
          </div>
        )}

        <div className="login-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Logo size={44} />
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to your account</p>
        </div>

        {isSuccess ? (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '1.25rem', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.95rem' }}>Login successful. Redirecting...</p>
          </div>
        ) : (
          <>
            {error && <div className="error-message shake">{error}</div>}

            <form onSubmit={handleLogin} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email" id="email" value={email} placeholder="you@example.com" required
                  onChange={e => { setEmail(e.target.value); setInvalidFields(f => f.filter(x => x !== 'email')); }}
                  className={`form-control ${invalidFields.includes('email') ? 'invalid-field' : ''}`}
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password" id="password" value={password} placeholder="••••••••" required
                  onChange={e => { setPassword(e.target.value); setInvalidFields(f => f.filter(x => x !== 'password')); }}
                  className={`form-control ${invalidFields.includes('password') ? 'invalid-field' : ''}`}
                  disabled={isLoading}
                />
              </div>

              <div className="form-actions">
                <Link to="/forgot-password" className="forgot-password">Forgot password?</Link>
              </div>

              <button type="submit" className={`login-button ${isLoading ? 'loading' : ''}`} disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="form-actions" style={{ justifyContent: 'center', marginTop: '1.5rem', marginBottom: 0 }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Don't have an account?{' '}
                  <Link to="/register" className="forgot-password" style={{ display: 'inline', marginLeft: '0.25rem' }}>Register</Link>
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
