import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './StudentLayout.css';
import Logo from './Logo';

const StudentLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const close = () => setOpen(false);

  const navItems = [
    { name: 'Dashboard',   path: '/student/dashboard' },
    { name: 'Schedule',    path: '/student/schedule' },
    { name: 'Attendance',  path: '/student/attendance' },
    { name: 'Performance', path: '/student/performance' },
    { name: 'Materials',   path: '/student/materials' },
  ];

  return (
    <div className="student-layout">
      <header className="mobile-topbar">
        <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        <div className="mobile-brand">
          <Logo size={24} />
          <span>Student Panel</span>
        </div>
      </header>

      {open && <div className="sidebar-backdrop" onClick={close} />}

      <aside className={`sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Logo size={28} />
            <h2>Student Panel</h2>
          </div>
          <button className="sidebar-close" onClick={close} aria-label="Close menu">✕</button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-title">Menu</div>
          {navItems.map(item => (
            <NavLink key={item.name} to={item.path} onClick={close}
              className={location.pathname === item.path ? 'nav-item active' : 'nav-item'}>
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/student/change-password" onClick={close}
            className={location.pathname === '/student/change-password' ? 'nav-item active' : 'nav-item'}
            style={{ marginBottom: '0.5rem', display: 'flex' }}>
            <span className="nav-text">Change Password</span>
          </NavLink>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="main-content">
        <div className="main-content-scrollable">{children}</div>
      </main>
    </div>
  );
};

export default StudentLayout;
