import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import './Login.css';
import Logo from '../components/Logo';

const Register = () => {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [error, setError]             = useState(null);
  const [isLoading, setIsLoading]     = useState(false);
  const [isSuccess, setIsSuccess]     = useState(false);
  const [invalidFields, setInvalidFields] = useState([]);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);
    setInvalidFields([]);
    setIsLoading(true);

    try {
      await api.post('/auth/register', { name, email, password });
      setIsSuccess(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setInvalidFields(['name', 'email', 'password']);
      if (!err.response) {
        setError('Network error: unable to connect to the server.');
      } else {
        setError(err.response.data?.message || 'Registration failed. Please check your data and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div style={{ marginBottom: '1rem' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textDecoration: 'none' }}>
            &larr; Back to Home
          </Link>
        </div>

        <div className="login-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <Logo size={44} />
          </div>
          <h2>Create Account</h2>
          <p>Student registration. Faculty accounts are created by admin.</p>
        </div>

        {isSuccess ? (
          <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#34d399', padding: '1.25rem', borderRadius: '8px', textAlign: 'center' }}>
            <p style={{ fontSize: '0.95rem' }}>Account created successfully. Redirecting to login...</p>
          </div>
        ) : (
          <>
            {error && <div className="error-message shake">{error}</div>}

            <form onSubmit={handleRegister} className="login-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input type="text" id="name" value={name} placeholder="John Doe" required
                  onChange={e => { setName(e.target.value); setInvalidFields(f => f.filter(x => x !== 'name')); }}
                  className={`form-control ${invalidFields.includes('name') ? 'invalid-field' : ''}`}
                  disabled={isLoading} />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input type="email" id="email" value={email} placeholder="you@example.com" required
                  onChange={e => { setEmail(e.target.value); setInvalidFields(f => f.filter(x => x !== 'email')); }}
                  className={`form-control ${invalidFields.includes('email') ? 'invalid-field' : ''}`}
                  disabled={isLoading} />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" id="password" value={password} placeholder="••••••••" required
                  onChange={e => { setPassword(e.target.value); setInvalidFields(f => f.filter(x => x !== 'password')); }}
                  className={`form-control ${invalidFields.includes('password') ? 'invalid-field' : ''}`}
                  disabled={isLoading} />
              </div>

              <button type="submit" className={`login-button ${isLoading ? 'loading' : ''}`}
                disabled={isLoading} style={{ marginTop: '1rem' }}>
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>

              <div className="form-actions" style={{ justifyContent: 'center', marginTop: '1.5rem', marginBottom: 0 }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
                  Already have an account?{' '}
                  <Link to="/login" className="forgot-password" style={{ display: 'inline', marginLeft: '0.25rem' }}>Log in</Link>
                </span>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
