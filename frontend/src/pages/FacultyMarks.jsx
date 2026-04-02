import React, { useState, useEffect } from 'react';
import api from '../services/api';

const inputStyle = {
  width: '100%', padding: '0.5rem 0.75rem', borderRadius: '6px',
  background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', fontSize: '0.95rem',
  colorScheme: 'dark', boxSizing: 'border-box',
};

const FacultyMarks = () => {
  const [batch, setBatch] = useState(null);
  const [students, setStudents] = useState([]);

  const [subject, setSubject] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [maxMarks, setMaxMarks] = useState(100);
  const [marksData, setMarksData] = useState({});

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const init = async () => {
      try {
        const batchRes = await api.get('/batches');
        const batches = batchRes.data.data || batchRes.data || [];
        if (!batches.length) { setLoading(false); return; }

        const myBatch = batches[0];
        setBatch(myBatch);

        const detail = await api.get(`/batches/${myBatch._id}`);
        const list = detail.data.students || [];
        setStudents(list);
        const init = {};
        list.forEach(st => { init[st.userId?._id || st._id] = ''; });
        setMarksData(init);
      } catch {
        setError('Failed to load batch data.');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const handleMarkChange = (id, value) => {
    setMarksData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!batch) return setError('No batch assigned.');
    if (!subject.trim()) return setError('Please enter a subject.');
    if (!date) return setError('Please select a date.');
    if (!maxMarks || maxMarks < 1) return setError('Max marks must be at least 1.');
    if (!students.length) return setError('No students in this batch.');

    for (const st of students) {
      const id = st.userId?._id || st._id;
      const val = marksData[id];
      if (val === '' || val === undefined) return setError('Please fill in marks for all students.');
      if (Number(val) < 0 || Number(val) > Number(maxMarks)) {
        const name = st.userId?.name || st.userId?.email || 'A student';
        return setError(`${name}'s marks must be between 0 and ${maxMarks}.`);
      }
    }

    try {
      setSubmitting(true);
      const testRes = await api.post('/tests', {
        batchId: batch._id,
        subject: subject.trim(),
        date,
        maxMarks: Number(maxMarks),
      });
      const testId = testRes.data.test._id;

      const marksRecords = students.map(st => {
        const id = st.userId?._id || st._id;
        return { studentId: id, marksObtained: Number(marksData[id]) };
      });

      await api.post('/marks', { testId, marksRecords });

      setSuccess(`Marks recorded for "${subject}" on ${date}.`);
      setSubject('');
      setDate(new Date().toISOString().split('T')[0]);
      setMaxMarks(100);
      const reset = {};
      students.forEach(st => { reset[st.userId?._id || st._id] = ''; });
      setMarksData(reset);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit marks.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading...</p>;

  return (
    <section style={{ animation: 'slideUp 0.4s ease forwards' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: '#fff' }}>Record Test Marks</h2>
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
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Subject</label>
                <input type="text" placeholder="e.g. Mathematics" value={subject} onChange={e => setSubject(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Date</label>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Max Marks</label>
                <input type="number" min="1" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} style={inputStyle} />
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }} />

            {students.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>No students in this batch.</p>
            ) : (
              <>
                <div style={{ overflowX: 'auto', marginBottom: '2rem' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <th style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: 600 }}>#</th>
                        <th style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: 600 }}>Student</th>
                        <th style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: 600 }}>
                          Marks <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/ {maxMarks}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((student, index) => {
                        const id = student.userId?._id || student._id;
                        const name = student.userId?.name || student.userId?.email || `Student ${index + 1}`;
                        const val = marksData[id] ?? '';
                        const isInvalid = val !== '' && (Number(val) < 0 || Number(val) > Number(maxMarks));

                        return (
                          <tr key={id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)' }}>{index + 1}</td>
                            <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: 500 }}>{name}</td>
                            <td style={{ padding: '1rem 1.5rem' }}>
                              <input
                                type="number" min="0" max={maxMarks}
                                placeholder={`0 – ${maxMarks}`}
                                value={val}
                                onChange={e => handleMarkChange(id, e.target.value)}
                                style={{ ...inputStyle, width: '120px', border: isInvalid ? '1px solid rgba(239,68,68,0.6)' : '1px solid rgba(255,255,255,0.1)' }}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button type="submit" disabled={submitting} className="login-button"
                    style={{ width: 'auto', padding: '0.875rem 2.5rem', opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                    {submitting ? 'Submitting...' : 'Submit Marks'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </section>
  );
};

export default FacultyMarks;
