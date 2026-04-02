import React, { useState, useEffect } from 'react';
import api from '../services/api';

const getGrade = (obtained, max) => {
  const pct = (obtained / max) * 100;
  if (pct >= 90) return { label: 'A+', color: '#10b981' };
  if (pct >= 75) return { label: 'A',  color: '#34d399' };
  if (pct >= 60) return { label: 'B',  color: '#60a5fa' };
  if (pct >= 45) return { label: 'C',  color: '#fbbf24' };
  if (pct >= 33) return { label: 'D',  color: '#f97316' };
  return                { label: 'F',  color: '#ef4444' };
};

const selectStyle = {
  width: '100%',
  padding: '0.875rem 1rem',
  borderRadius: '8px',
  background: 'rgba(0,0,0,0.2)',
  border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff',
  outline: 'none',
  fontSize: '0.95rem',
  cursor: 'pointer',
  colorScheme: 'dark',
};

const FacultyPerformance = () => {
  const [batches, setBatches]           = useState([]);
  const [selectedBatch, setSelectedBatch] = useState('');

  const [tests, setTests]               = useState([]);
  const [selectedTest, setSelectedTest] = useState('');

  const [testInfo, setTestInfo]         = useState(null);
  const [marks, setMarks]               = useState([]);

  const [loadingBatches, setLoadingBatches]   = useState(true);
  const [loadingTests, setLoadingTests]       = useState(false);
  const [loadingMarks, setLoadingMarks]       = useState(false);
  const [error, setError]               = useState('');

  // Fetch batches on mount
  useEffect(() => {
    api.get('/batches')
      .then(res => setBatches(res.data.data || res.data || []))
      .catch(() => setError('Failed to load batches.'))
      .finally(() => setLoadingBatches(false));
  }, []);

  // Fetch tests when batch changes
  useEffect(() => {
    if (!selectedBatch) { setTests([]); setSelectedTest(''); setMarks([]); setTestInfo(null); return; }
    setLoadingTests(true);
    setError('');
    setMarks([]);
    setTestInfo(null);
    setSelectedTest('');
    api.get(`/tests/batch/${selectedBatch}`)
      .then(res => setTests(Array.isArray(res.data) ? res.data : []))
      .catch(() => setError('Failed to load tests for this batch.'))
      .finally(() => setLoadingTests(false));
  }, [selectedBatch]);

  // Fetch marks when test changes
  useEffect(() => {
    if (!selectedTest) { setMarks([]); setTestInfo(null); return; }
    setLoadingMarks(true);
    setError('');
    api.get(`/marks/test/${selectedTest}`)
      .then(res => { setTestInfo(res.data.testInfo); setMarks(res.data.marks || []); })
      .catch(() => setError('Failed to load marks for this test.'))
      .finally(() => setLoadingMarks(false));
  }, [selectedTest]);

  return (
    <section style={{ animation: 'slideUp 0.4s ease forwards' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: '#fff' }}>Student Performance</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
          Select a batch and test to view student scores and grades.
        </p>
      </div>

      {error && (
        <div className="error-message shake" style={{ marginBottom: '1.5rem' }}>{error}</div>
      )}

      <div style={{
        background: 'var(--bg-card)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.05)',
        padding: '2rem',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)'
      }}>

        {/* Filters */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Batch</label>
            {loadingBatches ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</p>
            ) : (
              <select value={selectedBatch} onChange={e => setSelectedBatch(e.target.value)} style={selectStyle}>
                <option value="">-- Select Batch --</option>
                {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
              </select>
            )}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1' }}>Test</label>
            <select
              value={selectedTest}
              onChange={e => setSelectedTest(e.target.value)}
              disabled={!selectedBatch || loadingTests}
              style={{ ...selectStyle, opacity: (!selectedBatch || loadingTests) ? 0.5 : 1 }}
            >
              <option value="">
                {loadingTests ? 'Loading tests...' : tests.length === 0 && selectedBatch ? 'No tests found' : '-- Select Test --'}
              </option>
              {tests.map(t => (
                <option key={t._id} value={t._id}>
                  {t.subject} — {t.date} (/{t.maxMarks})
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', marginBottom: '2rem' }} />

        {/* Test summary strip */}
        {testInfo && (
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '1rem',
            marginBottom: '1.5rem'
          }}>
            {[
              { label: 'Subject',   value: testInfo.subject },
              { label: 'Date',      value: testInfo.date },
              { label: 'Max Marks', value: testInfo.maxMarks },
              { label: 'Batch',     value: testInfo.batchName },
              { label: 'Students',  value: marks.length },
            ].map(item => (
              <div key={item.label} style={{
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '8px',
                padding: '0.6rem 1.2rem',
                border: '1px solid rgba(255,255,255,0.07)'
              }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.label}</span>
                <p style={{ color: '#fff', fontWeight: '600', margin: '0.2rem 0 0' }}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Table */}
        {loadingMarks ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
            Loading performance data...
          </p>
        ) : !selectedTest ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
            Select a batch and test to view results.
          </p>
        ) : marks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0' }}>
            No marks recorded for this test yet.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  {['Rank', 'Student', 'Subject', 'Marks', 'Percentage', 'Grade'].map(h => (
                    <th key={h} style={{ padding: '1rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.9rem' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marks.map((record, index) => {
                  const name  = record.studentId?.name || record.studentId?.email || '—';
                  const obtained = record.marksObtained;
                  const max   = testInfo?.maxMarks || 100;
                  const pct   = ((obtained / max) * 100).toFixed(1);
                  const grade = getGrade(obtained, max);

                  return (
                    <tr key={record._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '1rem 1.5rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                        {index + 1}
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#fff', fontWeight: '500' }}>{name}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{testInfo?.subject || '—'}</td>
                      <td style={{ padding: '1rem 1.5rem', color: '#fff' }}>
                        {obtained} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ {max}</span>
                      </td>
                      <td style={{ padding: '1rem 1.5rem', color: '#cbd5e1' }}>{pct}%</td>
                      <td style={{ padding: '1rem 1.5rem' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          color: grade.color,
                          background: `${grade.color}20`,
                          border: `1px solid ${grade.color}40`,
                        }}>
                          {grade.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};

export default FacultyPerformance;
