import { useState, useEffect } from 'react';
import api from '../services/api';

const Performance = () => {
  const [marks, setMarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        setLoading(true);
        // GET /api/marks/my-marks mapped dynamically by the backend for students
        const response = await api.get('/marks/my-marks');
        
        const data = Array.isArray(response.data) ? response.data : [];
        setMarks(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load performance reports.');
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  // Utility to calculate grade
  const calculateGrade = (obtained, max) => {
    if (!max) return 'N/A';
    const percentage = (obtained / max) * 100;
    if (percentage >= 90) return { grade: 'A+', color: '#10b981' }; // Green
    if (percentage >= 80) return { grade: 'A', color: '#3b82f6' };  // Blue
    if (percentage >= 70) return { grade: 'B', color: '#8b5cf6' };  // Purple
    if (percentage >= 60) return { grade: 'C', color: '#f59e0b' };  // Yellow
    if (percentage >= 50) return { grade: 'D', color: '#f97316' };  // Orange
    return { grade: 'F', color: '#ef4444' }; // Red
  };

  // Utility to format dates
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <section style={{ animation: 'none', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Performance Reports</h2>
          </div>

          {loading && (
            <div className="status-card" style={{ maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
              <div className="status-indicator online">
                <span className="pulse"></span>
                <p>Loading performance data...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="error-message shake" style={{ marginBottom: '2rem' }}>
              {error}
            </div>
          )}

          {!loading && !error && marks.length === 0 && (
            <div className="status-card" style={{ maxWidth: '100%', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--text-muted)' }}>No data</h3>
              <p>No test marks have been recorded for you yet.</p>
            </div>
          )}

          {!loading && !error && marks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* CSS Bar Chart Section */}
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                padding: '2rem',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
              }}>
                <h3 style={{ marginBottom: '1.5rem', color: '#fff', fontSize: '1.25rem' }}>Academic Overview</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  {marks.map((record, index) => {
                    const obtained = record.marksObtained || 0;
                    const max = record.testId?.maxMarks || 100;
                    const percentage = Math.min((obtained / max) * 100, 100);
                    const { color } = calculateGrade(obtained, max);

                    return (
                      <div key={`chart-${index}`}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                          <span style={{ color: '#cbd5e1' }}>{record.testId?.subject || 'Test'} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>({formatDate(record.testId?.date)})</span></span>
                          <strong style={{ color: '#fff' }}>{percentage.toFixed(0)}%</strong>
                        </div>
                        <div style={{ width: '100%', background: 'rgba(255,255,255,0.05)', height: '12px', borderRadius: '99px', overflow: 'hidden' }}>
                          <div style={{ 
                            width: `${percentage}%`, 
                            background: color, 
                            height: '100%', 
                            borderRadius: '99px',
                            transition: 'width 1s ease-in-out',
                            boxShadow: `0 0 10px ${color}80`
                          }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Data Table Section */}
              <div style={{
                background: 'var(--bg-card)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                overflow: 'hidden',
                boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
              }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <th style={{ padding: '1.25rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.95rem' }}>Subject</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.95rem' }}>Test Date</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.95rem' }}>Marks</th>
                      <th style={{ padding: '1.25rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.95rem', textAlign: 'center' }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((record, index) => {
                      const obtained = record.marksObtained;
                      const max = record.testId?.maxMarks;
                      const { grade, color } = calculateGrade(obtained, max);

                      return (
                        <tr key={record._id || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#fff', fontWeight: '500' }}>
                            {record.testId?.subject || 'Unnamed Subject'}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>
                            {formatDate(record.testId?.date)}
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', color: '#cbd5e1' }}>
                            <strong style={{ color: '#fff' }}>{obtained}</strong> <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>/ {max}</span>
                          </td>
                          <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                            <span style={{ 
                              background: `${color}15`, 
                              color: color, 
                              padding: '0.35rem 1rem', 
                              borderRadius: '8px',
                              fontSize: '0.9rem',
                              fontWeight: '700',
                              border: `1px solid ${color}30`,
                              display: 'inline-block',
                              minWidth: '60px'
                            }}>
                              {grade}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
            </div>
          )}
        </section>
    </div>
  );
};

export default Performance;
