import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem('name') || localStorage.getItem('email') || 'Student';

  const [batch,      setBatch]      = useState(null);
  const [schedules,  setSchedules]  = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [marks,      setMarks]      = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/batches'),
      api.get('/schedules/my-schedule'),
      api.get('/attendance/my-attendance'),
      api.get('/marks/my-marks'),
    ]).then(([bR, sR, aR, mR]) => {
      if (bR.status === 'fulfilled') setBatch((bR.value.data.data || [])[0] || null);
      if (sR.status === 'fulfilled') setSchedules(sR.value.data.schedules || []);
      if (aR.status === 'fulfilled') setAttendance(Array.isArray(aR.value.data) ? aR.value.data : []);
      if (mR.status === 'fulfilled') setMarks(Array.isArray(mR.value.data) ? mR.value.data : []);
      setLoading(false);
    });
  }, []);

  const today        = DAYS[new Date().getDay()];
  const present      = attendance.filter(a => a.status === 'Present').length;
  const attPct       = attendance.length ? Math.round((present / attendance.length) * 100) : 0;
  const latestMark   = marks[0];
  const latestPct    = latestMark
    ? Math.round((latestMark.marksObtained / (latestMark.testId?.maxMarks || 100)) * 100)
    : null;
  const todayClasses = schedules.filter(s => s.day === today);

  const pctColor = (pct) => pct >= 75 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444';

  if (loading) return <p style={{ color: '#94a3b8', padding: '2rem' }}>Loading...</p>;

  return (
    <div>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#fff', fontSize: '1.6rem', fontWeight: 700, margin: 0 }}>
          Welcome, {name}
        </h2>
        {batch && (
          <p style={{ color: '#94a3b8', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Batch: <span style={{ color: '#a5b4fc' }}>{batch.name}</span>
            {batch.facultyId?.name && (
              <> &nbsp;|&nbsp; Faculty: <span style={{ color: '#a5b4fc' }}>{batch.facultyId.name}</span></>
            )}
          </p>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>

        <div style={card}>
          <p style={cardLabel}>Attendance</p>
          <p style={{ ...cardValue, color: attendance.length ? pctColor(attPct) : '#94a3b8' }}>
            {attendance.length ? `${attPct}%` : '—'}
          </p>
          <p style={cardSub}>{attendance.length ? `${present} / ${attendance.length} classes` : 'No records'}</p>
        </div>

        <div style={card}>
          <p style={cardLabel}>Latest Score</p>
          <p style={{ ...cardValue, color: latestPct !== null ? pctColor(latestPct) : '#94a3b8' }}>
            {latestPct !== null ? `${latestPct}%` : '—'}
          </p>
          <p style={cardSub}>{latestMark?.testId?.subject || 'No tests yet'}</p>
        </div>

        <div style={card}>
          <p style={cardLabel}>Tests Taken</p>
          <p style={{ ...cardValue, color: '#818cf8' }}>{marks.length}</p>
          <p style={cardSub}>{marks.length ? 'results available' : 'No tests yet'}</p>
        </div>

        <div style={card}>
          <p style={cardLabel}>Classes Today</p>
          <p style={{ ...cardValue, color: '#38bdf8' }}>{todayClasses.length}</p>
          <p style={cardSub}>{today}</p>
        </div>

      </div>

      {/* Navigation cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>

        <div style={navCard} onClick={() => navigate('/student/schedule')}
          onMouseOver={e => e.currentTarget.style.borderColor = '#6366f1'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <p style={navLabel}>Class Schedule</p>
          <p style={navSub}>View your timetable</p>
        </div>

        <div style={navCard} onClick={() => navigate('/student/attendance')}
          onMouseOver={e => e.currentTarget.style.borderColor = '#10b981'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <p style={navLabel}>Attendance</p>
          <p style={navSub}>Check your record</p>
        </div>

        <div style={navCard} onClick={() => navigate('/student/performance')}
          onMouseOver={e => e.currentTarget.style.borderColor = '#f59e0b'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <p style={navLabel}>Performance</p>
          <p style={navSub}>See your test results</p>
        </div>

        <div style={navCard} onClick={() => navigate('/student/materials')}
          onMouseOver={e => e.currentTarget.style.borderColor = '#a78bfa'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          <p style={navLabel}>Materials</p>
          <p style={navSub}>Access study resources</p>
        </div>

      </div>

    </div>
  );
}

const card = {
  background: '#1e293b',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  padding: '1.2rem',
};
const cardLabel = { color: '#94a3b8', fontSize: '0.78rem', margin: '0 0 0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' };
const cardValue = { fontSize: '1.9rem', fontWeight: 800, margin: '0 0 0.25rem', lineHeight: 1 };
const cardSub   = { color: '#475569', fontSize: '0.75rem', margin: 0 };
const navCard   = { background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '1.4rem', cursor: 'pointer', transition: 'border-color 0.2s' };
const navLabel  = { color: '#f1f5f9', fontWeight: 600, fontSize: '0.95rem', margin: '0 0 0.3rem' };
const navSub    = { color: '#64748b', fontSize: '0.8rem', margin: 0 };
