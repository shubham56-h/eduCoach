import { useState, useEffect } from 'react';
import api from '../services/api';

const cards = [
  { key: 'students', label: 'Total Students', color: '#60a5fa' },
  { key: 'faculty',  label: 'Total Faculty',  color: '#a78bfa' },
  { key: 'batches',  label: 'Total Batches',  color: '#34d399' },
  { key: 'classes',  label: 'Total Classes',  color: '#fbbf24' },
];

const AdminRecords = () => {
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  useEffect(() => {
    api.get('/stats')
      .then(res => setStats(res.data))
      .catch(() => setError('Failed to load system records.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section style={{ animation: 'slideUp 0.4s ease forwards' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: '#fff' }}>System Records</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
          Live overview of all system data.
        </p>
      </div>

      {error && (
        <div className="error-message shake" style={{ marginBottom: '1.5rem' }}>{error}</div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading...</p>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem',
        }}>
          {cards.map((card, i) => (
            <div key={card.key} style={{
              background: 'var(--bg-card)',
              borderRadius: '16px',
              border: `1px solid ${card.color}25`,
              padding: '2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              animation: `slideUp ${0.1 + i * 0.1}s ease forwards`,
              boxShadow: `0 8px 24px -8px ${card.color}20`,
            }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.4rem' }}>
                  {card.label}
                </p>
                <p style={{ color: card.color, fontSize: '2.8rem', fontWeight: '700', margin: 0, lineHeight: 1 }}>
                  {stats?.[card.key] ?? '—'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default AdminRecords;
