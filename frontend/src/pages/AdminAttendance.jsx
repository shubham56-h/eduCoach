import { useState, useEffect } from 'react';
import api from '../services/api';

const getGrade = (obtained, max) => {
  const pct = (obtained / max) * 100;
  if (pct >= 90) return { label: 'A+', color: '#10b981' };
  if (pct >= 75) return { label: 'A',  color: '#34d399' };
  if (pct >= 60) return { label: 'B',  color: '#60a5fa' };
  if (pct >= 45) return { label: 'C',  color: '#fbbf24' };
  if (pct >= 33) return { label: 'D',  color: '#f97316' };
  return               { label: 'F',  color: '#ef4444' };
};

const selectStyle = {
  padding: '0.6rem 1rem', borderRadius: '8px',
  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', fontSize: '0.9rem',
  cursor: 'pointer', colorScheme: 'dark',
};

const statCard  = { background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.6rem 1.2rem', border: '1px solid rgba(255,255,255,0.07)' };
const statLabel = { color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0 0 0.2rem', display: 'block' };
const statValue = { fontWeight: 700, fontSize: '1.3rem', margin: 0, display: 'block' };

const TAB = { ATTENDANCE: 'attendance', RESULTS: 'results' };

const AdminAttendance = () => {
  const [tab, setTab]             = useState(TAB.ATTENDANCE);
  const [batches, setBatches]     = useState([]);
  const [batchId, setBatchId]     = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [tests, setTests]         = useState([]);
  const [testId, setTestId]       = useState('');
  const [subject, setSubject]     = useState('');

  const [attendance, setAttendance] = useState([]);
  const [marks, setMarks]           = useState([]);

  const [loadingA, setLoadingA] = useState(false);
  const [loadingM, setLoadingM] = useState(false);
  const [error, setError]       = useState('');

  useEffect(() => {
    api.get('/batches')
      .then(res => setBatches(res.data.data || []))
      .catch(() => setError('Failed to load batches.'));
  }, []);

  useEffect(() => {
    setStudentSearch('');
    setTestId(''); setTests([]);
    setSubject('');
    if (!batchId) return;
    api.get(`/tests/batch/${batchId}`).then(res => setTests(Array.isArray(res.data) ? res.data : [])).catch(() => {});
  }, [batchId]);

  useEffect(() => {
    if (tab !== TAB.ATTENDANCE) return;
    setLoadingA(true); setError('');
    const p = new URLSearchParams();
    if (batchId) p.append('batchId', batchId);
    if (subject) p.append('subject', subject);
    api.get(`/attendance?${p}`)
      .then(res => setAttendance(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load attendance.'))
      .finally(() => setLoadingA(false));
  }, [tab, batchId, subject]);

  useEffect(() => {
    if (tab !== TAB.RESULTS) return;
    setLoadingM(true); setError('');
    const p = new URLSearchParams();
    if (testId)       p.append('testId', testId);
    else if (batchId) p.append('batchId', batchId);
    api.get(`/marks?${p}`)
      .then(res => setMarks(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load marks.'))
      .finally(() => setLoadingM(false));
  }, [tab, batchId, testId]);

  // Client-side student name filter
  const filteredAttendance = studentSearch
    ? attendance.filter(r => {
        const name = (r.studentId?.name || r.studentId?.email || '').toLowerCase();
        return name.includes(studentSearch.toLowerCase());
      })
    : attendance;

  const filteredMarks = studentSearch
    ? marks.filter(r => {
        const name = (r.studentId?.name || r.studentId?.email || '').toLowerCase();
        return name.includes(studentSearch.toLowerCase());
      })
    : marks;

  // Attendance stats
  const totalPresent = filteredAttendance.filter(r => r.status === 'Present').length;
  const totalAbsent  = filteredAttendance.length - totalPresent;
  const attRate      = filteredAttendance.length ? ((totalPresent / filteredAttendance.length) * 100).toFixed(1) : null;

  // Results stats
  const markValues  = filteredMarks.map(r => r.marksObtained);
  const highestMark = markValues.length ? Math.max(...markValues) : null;
  const lowestMark  = markValues.length ? Math.min(...markValues) : null;
  const highestRec  = filteredMarks.find(r => r.marksObtained === highestMark);
  const lowestRec   = filteredMarks.find(r => r.marksObtained === lowestMark);
  const avgMark     = markValues.length ? (markValues.reduce((a, b) => a + b, 0) / markValues.length).toFixed(1) : null;

  const tabBtn = (label, value) => (
    <button onClick={() => { setTab(value); setError(''); }} style={{
      padding: '0.65rem 1.75rem', borderRadius: '8px', fontWeight: '600',
      fontSize: '0.95rem', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
      background: tab === value ? '#2563eb' : 'rgba(255,255,255,0.05)',
      color: tab === value ? '#fff' : '#94a3b8',
      boxShadow: tab === value ? '0 4px 12px rgba(37,99,235,0.3)' : 'none',
    }}>{label}</button>
  );

  return (
    <section style={{ animation: 'slideUp 0.4s ease forwards' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: '#fff' }}>Attendance & Results</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>Monitor student attendance and academic performance.</p>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.75rem' }}>
        {tabBtn('Attendance', TAB.ATTENDANCE)}
        {tabBtn('Results', TAB.RESULTS)}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem', alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8', fontSize: '0.82rem' }}>Filter by Batch</label>
          <select value={batchId} onChange={e => setBatchId(e.target.value)} style={selectStyle}>
            <option value="">All Batches</option>
            {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8', fontSize: '0.82rem' }}>Search by Student</label>
          <input
            type="text" placeholder="Name or email..." value={studentSearch}
            onChange={e => setStudentSearch(e.target.value)}
            style={{ ...selectStyle, cursor: 'text', minWidth: '180px' }}
          />
        </div>
        {tab === TAB.ATTENDANCE && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8', fontSize: '0.82rem' }}>Filter by Subject</label>
            <input
              type="text" placeholder="e.g. Mathematics" value={subject}
              onChange={e => setSubject(e.target.value)}
              style={{ ...selectStyle, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem 1rem', borderRadius: '8px', color: '#fff', outline: 'none', fontSize: '0.9rem', colorScheme: 'dark' }}
            />
          </div>
        )}
        {tab === TAB.RESULTS && (
          <div>
            <label style={{ display: 'block', marginBottom: '0.35rem', color: '#94a3b8', fontSize: '0.82rem' }}>Filter by Test</label>            <select value={testId} onChange={e => setTestId(e.target.value)}
              disabled={!batchId || !tests.length}
              style={{ ...selectStyle, opacity: (!batchId || !tests.length) ? 0.5 : 1 }}>
              <option value="">{!batchId ? 'Select batch first' : tests.length === 0 ? 'No tests' : 'All Tests'}</option>
              {tests.map(t => <option key={t._id} value={t._id}>{t.subject} — {t.date}</option>)}
            </select>
          </div>
        )}
        {(batchId || studentSearch || testId || subject) && (
          <button onClick={() => { setBatchId(''); setStudentSearch(''); setTestId(''); setSubject(''); }}
            style={{ ...selectStyle, marginTop: '1.2rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
            Clear Filters
          </button>
        )}
      </div>

      {error && <div className="error-message shake" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      {tab === TAB.ATTENDANCE && (
        loadingA ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading attendance...</p>
        ) : filteredAttendance.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No attendance records found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={statCard}><span style={statLabel}>Total Records</span><span style={{ ...statValue, color: '#cbd5e1' }}>{filteredAttendance.length}</span></div>
              <div style={statCard}><span style={statLabel}>Present</span><span style={{ ...statValue, color: '#10b981' }}>{totalPresent}</span></div>
              <div style={statCard}><span style={statLabel}>Absent</span><span style={{ ...statValue, color: '#ef4444' }}>{totalAbsent}</span></div>
              <div style={statCard}><span style={statLabel}>Attendance Rate</span><span style={{ ...statValue, color: '#60a5fa' }}>{attRate}%</span></div>
            </div>
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['#', 'Student', 'Batch', 'Subject', 'Date', 'Status'].map(h => (
                        <th key={h} style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.9rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((rec, i) => {
                      const isPresent = rec.status === 'Present';
                      return (
                        <tr key={rec._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: '500' }}>{rec.studentId?.name || rec.studentId?.email || '—'}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{rec.scheduleId?.batchId?.name || '—'}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{rec.scheduleId?.subject || '—'}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{rec.date}</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '600', color: isPresent ? '#10b981' : '#ef4444', background: isPresent ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)', border: `1px solid ${isPresent ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}` }}>{rec.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}

      {tab === TAB.RESULTS && (
        loadingM ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading results...</p>
        ) : filteredMarks.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '3rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', margin: 0 }}>No marks records found.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={statCard}><span style={statLabel}>Total Records</span><span style={{ ...statValue, color: '#cbd5e1' }}>{filteredMarks.length}</span></div>
              <div style={statCard}>
                <span style={statLabel}>Highest</span>
                <span style={{ ...statValue, color: '#10b981' }}>{highestMark}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.35rem' }}>{highestRec?.studentId?.name || highestRec?.studentId?.email || ''}</span></span>
              </div>
              <div style={statCard}>
                <span style={statLabel}>Lowest</span>
                <span style={{ ...statValue, color: '#ef4444' }}>{lowestMark}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)', marginLeft: '0.35rem' }}>{lowestRec?.studentId?.name || lowestRec?.studentId?.email || ''}</span></span>
              </div>
              <div style={statCard}><span style={statLabel}>Average</span><span style={{ ...statValue, color: '#fbbf24' }}>{avgMark}</span></div>
            </div>
            <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['#', 'Student', 'Batch', 'Subject', 'Date', 'Marks', '%', 'Grade'].map(h => (
                        <th key={h} style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.9rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMarks.map((rec, i) => {
                      const max   = rec.testId?.maxMarks || 100;
                      const pct   = ((rec.marksObtained / max) * 100).toFixed(1);
                      const grade = getGrade(rec.marksObtained, max);
                      const isHigh = rec.marksObtained === highestMark;
                      const isLow  = rec.marksObtained === lowestMark && highestMark !== lowestMark;
                      return (
                        <tr key={rec._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: isHigh ? 'rgba(16,185,129,0.04)' : isLow ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{i + 1}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: '500' }}>{rec.studentId?.name || rec.studentId?.email || '—'}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{rec.testId?.batchId?.name || '—'}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{rec.testId?.subject || '—'}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{rec.testId?.date || '—'}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#fff' }}>{rec.marksObtained}<span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}> / {max}</span></td>
                          <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{pct}%</td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{ padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.82rem', fontWeight: '700', color: grade.color, background: `${grade.color}20`, border: `1px solid ${grade.color}40` }}>{grade.label}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </section>
  );
};

export default AdminAttendance;
