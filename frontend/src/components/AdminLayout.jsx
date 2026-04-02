import { NavLink, useNavigate } from 'react-router-dom';
import './FacultyLayout.css';
import Logo from './Logo';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard',          path: '/admin/dashboard' },
    { name: 'Users',              path: '/admin/users' },
    { name: 'Batches',            path: '/admin/batches' },
    { name: 'Schedule',           path: '/admin/schedule' },
    { name: 'Attendance & Results', path: '/admin/monitor' },
    { name: 'System Records',     path: '/admin/records' },
  ];

  return (
    <div className="faculty-layout">
      <aside className="faculty-sidebar">
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Logo size={28} />
            <h2>Admin Panel</h2>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-title">Admin Menu</div>
          {navItems.map(item => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
            >
              <span className="nav-text">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/admin/change-password" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} style={{ marginBottom: '0.5rem', display: 'flex' }}>
            <span className="nav-text">Change Password</span>
          </NavLink>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="faculty-content">
        <div className="content-scrollable">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
