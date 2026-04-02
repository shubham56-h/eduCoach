import { useState, useEffect } from 'react';
import api from '../services/api';

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

const inputStyle = {
  width: '100%', padding: '0.75rem 1rem', borderRadius: '8px',
  background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)',
  color: '#fff', outline: 'none', fontSize: '0.95rem',
  boxSizing: 'border-box', colorScheme: 'dark',
};

const EMPTY_FORM = { batchId: '', subject: '', day: 'Monday', time: '' };

const AdminSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [batches, setBatches]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');
  const [filterBatch, setFilterBatch] = useState('');

  const [showModal, setShowModal]       = useState(false);
  const [editSchedule, setEditSchedule] = useState(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [formError, setFormError]       = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [deletingId, setDeletingId]     = useState(null);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [batchRes, schRes] = await Promise.allSettled([
        api.get('/batches'),
        api.get('/schedules'),
      ]);
      if (batchRes.status === 'fulfilled') setBatches(batchRes.value.data.data || []);
      if (schRes.status  === 'fulfilled') setSchedules(Array.isArray(schRes.value.data) ? schRes.value.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const openModal = () => { setEditSchedule(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit  = (sch) => {
    setEditSchedule(sch);
    setForm({ batchId: sch.batchId?._id || sch.batchId, subject: sch.subject, day: sch.day, time: sch.time });
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setFormError(''); setEditSchedule(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.batchId)        return setFormError('Please select a batch.');
    if (!form.subject.trim()) return setFormError('Subject is required.');
    if (!form.time.trim())    return setFormError('Time is required.');
    try {
      setSubmitting(true);
      if (editSchedule) {
        await api.put(`/schedules/${editSchedule._id}`, { batchId: form.batchId, subject: form.subject.trim(), day: form.day, time: form.time.trim() });
        setSuccess('Schedule updated.');
      } else {
        await api.post('/schedules', { batchId: form.batchId, subject: form.subject.trim(), day: form.day, time: form.time.trim() });
        setSuccess('Schedule added.');
      }
      closeModal();
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save schedule.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule entry?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/schedules/${id}`);
      setSuccess('Schedule deleted.');
      setSchedules(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete.');
    } finally {
      setDeletingId(null);
    }
  };

  // Filter and group by batch, then by day
  const filtered = filterBatch ? schedules.filter(s => (s.batchId?._id || s.batchId) === filterBatch) : schedules;

  // Group by batch
  const byBatch = {};
  filtered.forEach(sch => {
    const bId   = sch.batchId?._id || sch.batchId || 'unknown';
    const bName = sch.batchId?.name || 'Unknown Batch';
    const fName = sch.batchId?.facultyId?.name || sch.batchId?.facultyId?.email || '—';
    if (!byBatch[bId]) byBatch[bId] = { name: bName, faculty: fName, days: {} };
    if (!byBatch[bId].days[sch.day]) byBatch[bId].days[sch.day] = [];
    byBatch[bId].days[sch.day].push(sch);
  });

  // Sort slots within each day by time
  Object.values(byBatch).forEach(b =>
    Object.values(b.days).forEach(slots =>
      slots.sort((a, b) => a.time.localeCompare(b.time))
    )
  );

  const batchEntries = Object.entries(byBatch);

  return (
    <section style={{ animation: 'slideUp 0.4s ease forwards' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: '#fff' }}>Schedule Classes</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem', margin: 0 }}>
            Weekly timetable grouped by batch.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {batches.length > 0 && (
            <select value={filterBatch} onChange={e => setFilterBatch(e.target.value)}
              style={{ padding: '0.65rem 1rem', borderRadius: '8px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', outline: 'none', fontSize: '0.9rem', colorScheme: 'dark', cursor: 'pointer' }}>
              <option value="">All Batches</option>
              {batches.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
            </select>
          )}
          <button onClick={openModal} className="login-button" style={{ width: 'auto', padding: '0.65rem 1.5rem' }}>
            + Add Schedule
          </button>
        </div>
      </div>

      {error   && <div className="error-message shake" style={{ marginBottom: '1.5rem' }}>{error}</div>}
      {success && <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)' }}>{success}</div>}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>Loading schedules...</p>
      ) : batchEntries.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No schedules yet. Add one to get started.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {batchEntries.map(([bId, bData]) => (
            <div key={bId} style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
              {/* Batch header */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.05rem' }}>{bData.name}</span>
                <span style={{ color: '#a78bfa', fontSize: '0.85rem' }}>Faculty: {bData.faculty}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginLeft: 'auto' }}>
                  {Object.values(bData.days).flat().length} class{Object.values(bData.days).flat().length !== 1 ? 'es' : ''} / week
                </span>
              </div>

              {/* Day columns grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 0 }}>
                {DAYS.map(day => {
                  const slots = bData.days[day] || [];
                  const col   = DAY_COLORS[day];
                  return (
                    <div key={day} style={{ borderRight: '1px solid rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.04)', padding: '0.875rem', minHeight: '80px' }}>
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
                          {slots.map(sch => (
                            <div key={sch._id} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '6px', padding: '0.45rem 0.6rem', border: '1px solid rgba(255,255,255,0.06)' }}>
                              <p style={{ color: '#fff', fontWeight: 600, fontSize: '0.82rem', margin: '0 0 0.15rem', lineHeight: 1.2 }}>{sch.subject}</p>
                              <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', margin: '0 0 0.35rem' }}>{sch.time}</p>
                              <div style={{ display: 'flex', gap: '0.3rem' }}>
                                <button onClick={() => openEdit(sch)}
                                  style={{ flex: 1, padding: '0.2rem 0', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(96,165,250,0.3)', background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>
                                  Edit
                                </button>
                                <button onClick={() => handleDelete(sch._id)} disabled={deletingId === sch._id}
                                  style={{ flex: 1, padding: '0.2rem 0', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.1)', color: '#f87171', opacity: deletingId === sch._id ? 0.5 : 1 }}>
                                  {deletingId === sch._id ? '...' : 'Del'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', width: '100%', maxWidth: '480px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.2rem' }}>{editSchedule ? 'Edit Schedule' : 'Add Schedule'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.4rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {formError && <div style={{ padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.9rem' }}>{formError}</div>}

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Batch</label>
                <select value={form.batchId} onChange={e => setForm(p => ({ ...p, batchId: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">-- Select Batch --</option>
                  {batches.map(b => <option key={b._id} value={b._id}>{b.name}{b.facultyId?.name ? ` (${b.facultyId.name})` : ''}</option>)}
                </select>
                {batches.length === 0 && <p style={{ color: '#f59e0b', fontSize: '0.82rem', marginTop: '0.4rem' }}>No batches found. Create a batch first.</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Subject</label>
                <input type="text" placeholder="e.g. Mathematics" value={form.subject}
                  onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} style={inputStyle} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Day</label>
                  <select value={form.day} onChange={e => setForm(p => ({ ...p, day: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontSize: '0.9rem' }}>Time</label>
                  <input type="text" placeholder="e.g. 10:00 AM" value={form.time}
                    onChange={e => setForm(p => ({ ...p, time: e.target.value }))} style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', cursor: 'pointer', background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontWeight: '600', fontSize: '0.95rem' }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="login-button"
                  style={{ flex: 1, padding: '0.8rem', opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                  {submitting ? 'Saving...' : editSchedule ? 'Update' : 'Add Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminSchedule;
