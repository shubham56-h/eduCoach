import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const cards = [
  { title: 'Attendance',          path: '/faculty/attendance',         desc: 'Mark attendance for your batch.' },
  { title: 'View Records',        path: '/faculty/attendance-records', desc: 'Browse and filter attendance history.' },
  { title: 'Schedule',            path: '/faculty/schedule',           desc: 'View your weekly class timetable.' },
  { title: 'Upload Material',     path: '/faculty/upload-material',    desc: 'Share study materials with students.' },
  { title: 'Record Marks',        path: '/faculty/marks',              desc: 'Enter and manage test scores.' },
  { title: 'Student Performance', path: '/faculty/performance',        desc: 'View grades and academic progress.' },
];

const FacultyDashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || localStorage.getItem('email') || 'Faculty';

  const [batch, setBatch]         = useState(null);
  const [studentCount, setStudentCount] = useState(null);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    api.get('/batches')
      .then(res => {
        const batches = res.data.data || res.data || [];
        if (!batches.length) { setLoading(false); return; }
        const b = batches[0];
        setBatch(b);
        // students virtual is populated in getBatches for faculty
        setStudentCount((b.students || []).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>Faculty Dashboard</h2>
        <p style={{ color: '#94a3b8', marginTop: '0.4rem', fontSize: '0.9rem' }}>Welcome, {name}</p>
      </div>

      {/* Batch info strip */}
      {!loading && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
          {batch ? (
            <>
              <div style={statCard}>
                <p style={statLabel}>Your Batch</p>
                <p style={{ ...statValue, color: '#60a5fa' }}>{batch.name}</p>
              </div>
              <div style={statCard}>
                <p style={statLabel}>Students</p>
                <p style={{ ...statValue, color: '#34d399' }}>{studentCount ?? '—'}</p>
              </div>
            </>
          ) : (
            <div style={{ ...statCard, borderColor: 'rgba(245,158,11,0.2)' }}>
              <p style={{ color: '#f59e0b', margin: 0, fontSize: '0.9rem' }}>No batch assigned yet.</p>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {cards.map(card => (
          <div
            key={card.path}
            onClick={() => navigate(card.path)}
            style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.5rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
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

const statCard = {
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  padding: '1rem 1.5rem',
  minWidth: '140px',
};
const statLabel = { color: '#64748b', fontSize: '0.75rem', margin: '0 0 0.3rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const statValue = { fontSize: '1.5rem', fontWeight: 700, margin: 0, lineHeight: 1 };

export default FacultyDashboard;
