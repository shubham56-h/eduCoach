const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DAY_COLORS = {
  Monday:    { bg: 'rgba(99,102,241,0.12)',  border: 'rgba(99,102,241,0.25)',  text: '#818cf8' },
  Tuesday:   { bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)',  text: '#60a5fa' },
  Wednesday: { bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.25)',  text: '#34d399' },
  Thursday:  { bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)',  text: '#fbbf24' },
  Friday:    { bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)',   text: '#f87171' },
  Saturday:  { bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)', text: '#a78bfa' },
  Sunday:    { bg: 'rgba(251,113,133,0.12)', border: 'rgba(251,113,133,0.25)', text: '#fb7185' },
};

// schedules: flat array of schedule objects
// showFaculty: show faculty name inside each slot (for student view)
const TimetableGrid = ({ schedules, loading, showFaculty = false }) => {
  if (loading) return <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading...</p>;

  if (!schedules.length) {
    return (
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '3rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>No classes scheduled yet.</p>
      </div>
    );
  }

  // Group by day, sort by time within each day
  const byDay = {};
  schedules.forEach(sch => {
    if (!byDay[sch.day]) byDay[sch.day] = [];
    byDay[sch.day].push(sch);
  });
  Object.values(byDay).forEach(slots => slots.sort((a, b) => a.time.localeCompare(b.time)));

  const totalClasses = schedules.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Summary */}
      <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', margin: 0 }}>
        {totalClasses} class{totalClasses !== 1 ? 'es' : ''} per week
      </p>

      {/* Grid card */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))' }}>
          {DAYS.map(day => {
            const slots = byDay[day] || [];
            const col   = DAY_COLORS[day];
            return (
              <div key={day} style={{ borderRight: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '0.875rem', minHeight: '90px' }}>
                {/* Day label */}
                <div style={{ marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: col.text, background: col.bg, border: `1px solid ${col.border}`, borderRadius: '4px', padding: '0.15rem 0.5rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {day.slice(0, 3)}
                  </span>
                </div>

                {slots.length === 0 ? (
                  <p style={{ color: 'rgba(255,255,255,0.1)', fontSize: '0.78rem', margin: 0, fontStyle: 'italic' }}>—</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {slots.map(sch => {
                      const faculty = sch.batchId?.facultyId?.name || sch.batchId?.facultyId?.email || '';
                      return (
                        <div key={sch._id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '0.45rem 0.6rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem', margin: '0 0 0.1rem', lineHeight: 1.2 }}>{sch.subject}</p>
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: 0 }}>{sch.time}</p>
                          {showFaculty && faculty && (
                            <p style={{ color: '#a78bfa', fontSize: '0.72rem', margin: '0.15rem 0 0' }}>{faculty}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimetableGrid;
