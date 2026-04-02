import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import './FacultyLayout.css';
import Logo from './Logo';

const FacultyLayout = ({ children }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => { localStorage.clear(); navigate('/login'); };
  const close = () => setOpen(false);

  const navItems = [
    { name: 'Dashboard',       path: '/faculty/dashboard' },
    { name: 'Schedule',        path: '/faculty/schedule' },
    { name: 'Attendance',      path: '/faculty/attendance' },
    { name: 'View Records',    path: '/faculty/attendance-records' },
    { name: 'Upload Material', path: '/faculty/upload-material' },
    { name: 'Marks',           path: '/faculty/marks' },
    { name: 'Performance',     path: '/faculty/performance' },
  ];

  return (
    <div className="faculty-layout">
      {/* Mobile top bar */}
      <header className="mobile-topbar">
        <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Toggle menu">
          <span /><span /><span />
        </button>
        <div className="mobile-brand">
          <Logo size={24} />
          <span>Faculty Panel</span>
        </div>
      </header>

      {/* Backdrop */}
      {open && <div className="sidebar-backdrop" onClick={close} />}

      <aside className={`faculty-sidebar${open ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Logo size={28} />
            <h2>Faculty Panel</h2>
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
          <NavLink to="/faculty/change-password" onClick={close}
            className={location.pathname === '/faculty/change-password' ? 'nav-item active' : 'nav-item'}
            style={{ marginBottom: '0.5rem', display: 'flex' }}>
            <span className="nav-text">Change Password</span>
          </NavLink>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </aside>

      <main className="faculty-content">
        <div className="content-scrollable">{children}</div>
      </main>
    </div>
  );
};

export default FacultyLayout;
