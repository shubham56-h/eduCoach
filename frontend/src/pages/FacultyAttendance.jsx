import { useState, useEffect } from 'react';
import api from '../services/api';

const FacultyAttendance = () => {
  const [batch, setBatch] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Faculty gets only their own batch
        const batchRes = await api.get('/batches');
        const batches = batchRes.data.data || batchRes.data || [];
        if (!batches.length) { setLoading(false); return; }

        const myBatch = batches[0];
        setBatch(myBatch);

        const [scheduleRes, batchDetail] = await Promise.all([
          api.get(`/schedules/batch/${myBatch._id}`),
          api.get(`/batches/${myBatch._id}`)
        ]);

        const fetchedSchedules = Array.isArray(scheduleRes.data) ? scheduleRes.data : [];
        setSchedules(fetchedSchedules);
        if (fetchedSchedules.length > 0) setSelectedSchedule(fetchedSchedules[0]._id);

        const batchStudents = batchDetail.data.students || [];
        setStudents(batchStudents);

        // All checked (Present) by default
        const init = {};
        batchStudents.forEach(st => {
          init[st.userId?._id || st._id] = true;
        });
        setAttendanceData(init);
      } catch (err) {
        setError('Failed to load batch data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const toggleAttendance = (studentId) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: !prev[studentId] }));
  };

  const markAll = (present) => {
    const updated = {};
    students.forEach(st => { updated[st.userId?._id || st._id] = present; });
    setAttendanceData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSchedule) return setError('Please select a schedule first.');
    if (!students.length) return setError('No students in this batch.');

    try {
      setSubmitting(true);
      setError(null);
      setSuccess('');

      const attendanceRecords = students.map(st => {
        const id = st.userId?._id || st._id;
        return { studentId: id, status: attendanceData[id] ? 'Present' : 'Absent' };
      });

      await api.post('/attendance', { scheduleId: selectedSchedule, date, attendanceRecords });
      setSuccess('Attendance submitted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving attendance.');
    } finally {
      setSubmitting(false);
    }
  };

  const presentCount = students.filter(st => attendanceData[st.userId?._id || st._id]).length;

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading...</p>;

  return (
    <section style={{ animation: 'slideUp 0.4s ease forwards' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: '#fff' }}>Batch Attendance</h2>
        {batch && (
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Batch: <span style={{ color: '#60a5fa', fontWeight: 600 }}>{batch.name}</span>
          </p>
        )}
      </div>

      {error && <div className="error-message shake" style={{ marginBottom: '1.5rem' }}>{error}</div>}
      {success && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>
          {success}
        </div>
      )}

      {!batch ? (
        <p style={{ color: 'var(--text-muted)' }}>No batch assigned to you yet.</p>
      ) : (
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '2rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)' }}>

          {/* Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Schedule</label>
              <select
                value={selectedSchedule}
                onChange={e => setSelectedSchedule(e.target.value)}
                disabled={!schedules.length}
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '0.95rem' }}
              >
                {schedules.length === 0
                  ? <option value="">No schedules available</option>
                  : schedules.map(sch => (
                    <option key={sch._id} value={sch._id}>{sch.subject} — {sch.day} @ {sch.time}</option>
                  ))
                }
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '0.95rem', colorScheme: 'dark' }}
              />
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '1.5rem' }} />

          {students.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No students in this batch.</p>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* Summary + bulk actions */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <span style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
                  Present: <span style={{ color: '#10b981', fontWeight: 700 }}>{presentCount}</span>
                  {' / '}
                  Absent: <span style={{ color: '#ef4444', fontWeight: 700 }}>{students.length - presentCount}</span>
                  {' '}
                  <span style={{ color: 'var(--text-muted)' }}>({students.length} total)</span>
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={() => markAll(true)}
                    style={{ padding: '0.4rem 1rem', borderRadius: '6px', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    All Present
                  </button>
                  <button type="button" onClick={() => markAll(false)}
                    style={{ padding: '0.4rem 1rem', borderRadius: '6px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                    All Absent
                  </button>
                </div>
              </div>

              <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: 600 }}>#</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: 600 }}>Student</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: 600, textAlign: 'center' }}>Present</th>
                      <th style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: 600 }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student, index) => {
                      const id = student.userId?._id || student._id;
                      const name = student.userId?.name || student.userId?.email || `Student ${index + 1}`;
                      const isPresent = !!attendanceData[id];

                      return (
                        <tr key={id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                          onClick={() => toggleAttendance(id)}>
                          <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{index + 1}</td>
                          <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: 500 }}>{name}</td>
                          <td style={{ padding: '1rem 1.5rem', textAlign: 'center' }}>
                            <input
                              type="checkbox"
                              checked={isPresent}
                              onChange={() => toggleAttendance(id)}
                              onClick={e => e.stopPropagation()}
                              style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10b981' }}
                            />
                          </td>
                          <td style={{ padding: '1rem 1.5rem' }}>
                            <span style={{
                              display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '20px',
                              fontSize: '0.82rem', fontWeight: 700,
                              color: isPresent ? '#10b981' : '#ef4444',
                              background: isPresent ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                              border: `1px solid ${isPresent ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                            }}>
                              {isPresent ? 'Present' : 'Absent'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="submit"
                  disabled={submitting || !selectedSchedule}
                  className="login-button"
                  style={{ width: 'auto', padding: '0.875rem 2rem', opacity: (submitting || !selectedSchedule) ? 0.6 : 1, cursor: (submitting || !selectedSchedule) ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Submitting...' : 'Submit Attendance'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </section>
  );
};

export default FacultyAttendance;
