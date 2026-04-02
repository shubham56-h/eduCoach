import { useNavigate } from 'react-router-dom';

const cards = [
  { title: 'Users',                path: '/admin/users',      desc: 'Add, edit, or remove student and faculty accounts.' },
  { title: 'Batches',              path: '/admin/batches',    desc: 'Create batches and assign students and faculty.' },
  { title: 'Schedule',             path: '/admin/schedule',   desc: 'Set up and manage class timetables.' },
  { title: 'Attendance & Results', path: '/admin/monitor',    desc: 'Review attendance records and student results.' },
  { title: 'System Records',       path: '/admin/records',    desc: 'View overall system statistics and counts.' },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || 'Admin';

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>Admin Dashboard</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.4rem', fontSize: '0.9rem' }}>Welcome, {name}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {cards.map(card => (
          <div
            key={card.path}
            onClick={() => navigate(card.path)}
            style={{
              background: '#1e293b',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '1.5rem',
              cursor: 'pointer',
              transition: 'border-color 0.2s',
            }}
            onMouseOver={e => e.currentTarget.style.borderColor = '#2563eb'}
            onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <p style={{ color: '#f1f5f9', fontWeight: 600, fontSize: '1rem', margin: '0 0 0.5rem' }}>{card.title}</p>
            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{card.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;
