import { useState, useEffect } from 'react';
import api from '../services/api';
import TimetableGrid from './TimetableGrid';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [batchName, setBatchName] = useState('');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  useEffect(() => {
    api.get('/schedules/my-schedule')
      .then(res => {
        setSchedules(res.data.schedules || []);
        // batchId is populated on each schedule entry
        const first = (res.data.schedules || [])[0];
        setBatchName(first?.batchId?.name || '');
      })
      .catch(err => setError(err.response?.data?.message || 'Failed to load schedule.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: '#fff' }}>Class Schedule</h2>
        {batchName && (
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
            Batch: <span style={{ color: '#60a5fa', fontWeight: 600 }}>{batchName}</span>
          </p>
        )}
      </div>

      {error && <div className="error-message shake" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <TimetableGrid schedules={schedules} loading={loading} showFaculty />
    </div>
  );
};

export default Schedule;
