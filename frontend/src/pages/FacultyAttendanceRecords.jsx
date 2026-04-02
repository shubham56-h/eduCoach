import { useState, useEffect } from 'react';
import api from '../services/api';

const selectStyle = {
  padding: '0.6rem 1rem', borderRadius: '8px',
  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', fontSize: '0.9rem',
  cursor: 'pointer', colorScheme: 'dark',
};

const FacultyAttendanceRecords = () => {
  const [records, setRecords]         = useState([]);
  const [batch, setBatch]             = useState(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [subject, setSubject]         = useState('');
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  // Load batch once
  useEffect(() => {
    api.get('/batches')
      .then(res => {
        const batches = res.data.data || res.data || [];
        if (batches.length) setBatch(batches[0]);
      })
      .catch(() => setError('Failed to load batch.'));
  }, []);

  // Fetch all records for this batch (subject filter sent to backend)
  useEffect(() => {
    setLoading(true);
    setError('');
    const p = new URLSearchParams();
    if (subject) p.append('subject', subject);
    api.get(`/attendance/my-batch?${p}`)
      .then(res => setRecords(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load attendance records.'))
      .finally(() => setLoading(false));
  }, [subject]);

  // Client-side student name filter
  const filtered = studentSearch
    ? records.filter(r => {
        const name = (r.studentId?.name || r.studentId?.email || '').toLowerCase();
        return name.includes(studentSearch.toLowerCase());
      })
    : records;

  const totalPresent = filtered.filter(r => r.status === 'Present').length;
  const totalAbsent  = filtered.length - totalPresent;

  const statCard  = { background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.6rem 1.2rem', border: '1px solid rgba(255,255,255,0.07)' };
  const statLabel = { color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0 0 0.2rem', display: 'block' };
  const statValue = { fontWeight: 700, fontSize: '1.3rem', margin: 0, display: 'block' };

  return (
    <section style={{ animation: 'slideUp 0.4s ease forwards' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: '#fff' }}>Attendance Records</h2>
        {batch && (
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
            Batch: <span style={{ color: '#60a5fa', fontWeight: 600 }}>{batch.name}</span>
          </p>
        )}
      </div>

      {error && <div className="error-message shake" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8', fontSize: '0.82rem' }}>Search by Student</label>
          <input
            type="text" placeholder="Name or email..." value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            style={{ ...selectStyle, cursor: 'text', minWidth: '180px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8', fontSize: '0.82rem' }}>Filter by Subject</label>
          <input
            type="text" placeholder="e.g. Mathematics" value={subject}
            onChange={e => setSubject(e.target.value)}
            style={{ ...selectStyle, cursor: 'text', minWidth: '180px' }}
          />
        </div>
        {(studentSearch || subject) && (
          <button onClick={() => { setStudentSearch(''); setSubject(''); }}
            style={{ ...selectStyle, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)', cursor: 'pointer' }}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Summary */}
          {records.length > 0 && (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={statCard}><span style={statLabel}>Total Records</span><span style={{ ...statValue, color: '#cbd5e1' }}>{filtered.length}</span></div>
              <div style={statCard}><span style={statLabel}>Present</span><span style={{ ...statValue, color: '#10b981' }}>{totalPresent}</span></div>
              <div style={statCard}><span style={statLabel}>Absent</span><span style={{ ...statValue, color: '#ef4444' }}>{totalAbsent}</span></div>
              <div style={statCard}><span style={statLabel}>Attendance Rate</span><span style={{ ...statValue, color: '#60a5fa' }}>{filtered.length ? ((totalPresent / filtered.length) * 100).toFixed(1) : 0}%</span></div>
            </div>
          )}

          {/* Table */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
            {filtered.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem', margin: 0 }}>No attendance records found.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['#', 'Student', 'Subject', 'Date', 'Status'].map(h => (
                        <th key={h} style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.9rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((rec, i) => {
                      const isPresent = rec.status === 'Present';
                      return (
                        <tr key={rec._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: '500' }}>
                            {rec.studentId?.name || rec.studentId?.email || '—'}
                          </td>
                          <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{rec.scheduleId?.subject || '—'}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{rec.date}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{
                              padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600',
                              color: isPresent ? '#10b981' : '#ef4444',
                              background: isPresent ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                              border: `1px solid ${isPresent ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`,
                            }}>{rec.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default FacultyAttendanceRecords;
