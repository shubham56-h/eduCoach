import { useState, useEffect } from 'react';
import api from '../services/api';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        // GET /api/attendance/my-attendance (as per backend route for students)
        const response = await api.get('/attendance/my-attendance');
        
        // The backend returns an array of attendance records
        const data = Array.isArray(response.data) ? response.data : [];
        setAttendance(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load attendance.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // Format the date correctly to a readable string
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <section style={{ animation: 'none', textAlign: 'left' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2.5rem', margin: 0 }}>Attendance Record</h2>
          </div>

          {loading && (
            <div className="status-card" style={{ maxWidth: '100%', display: 'flex', justifyContent: 'center' }}>
              <div className="status-indicator online">
                <span className="pulse"></span>
                <p>Loading attendance data...</p>
              </div>
            </div>
          )}

          {error && !loading && (
            <div className="error-message shake" style={{ marginBottom: '2rem' }}>
              {error}
            </div>
          )}

          {!loading && !error && attendance.length === 0 && (
            <div className="status-card" style={{ maxWidth: '100%', textAlign: 'center' }}>
              <h3 style={{ color: 'var(--text-muted)' }}>No data</h3>
              <p>Your attendance has not been marked for any classes yet.</p>
            </div>
          )}

          {!loading && !error && attendance.length > 0 && (
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
                    <th style={{ padding: '1.25rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.95rem' }}>Date</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.95rem' }}>Class / Subject</th>
                    <th style={{ padding: '1.25rem 1.5rem', color: '#cbd5e1', fontWeight: '600', fontSize: '0.95rem', textAlign: 'center' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, index) => {
                    const isPresent = record.status === 'Present';
                    return (
                      <tr key={record._id || index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                        <td style={{ padding: '1.25rem 1.5rem', color: '#fff' }}>
                          <strong>{formatDate(record.date)}</strong>
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', color: 'var(--text-muted)' }}>
                          {record.scheduleId?.subject || 'N/A'} {record.scheduleId?.time ? `(${record.scheduleId.time})` : ''}
                        </td>
                        <td style={{ padding: '1.25rem 1.5rem', textAlign: 'center' }}>
                          <span style={{ 
                            background: isPresent ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                            color: isPresent ? '#10b981' : '#ef4444', 
                            padding: '0.35rem 1rem', 
                            borderRadius: '99px',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'inline-block',
                            minWidth: '80px',
                            textAlign: 'center'
                          }}>
                            {record.status || 'Unknown'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
    </div>
  );
};

export default Attendance;
