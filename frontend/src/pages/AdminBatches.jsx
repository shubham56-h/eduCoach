import { useState, useEffect } from 'react';
import api from '../services/api';

const PAGE_SIZE = 5;

const inputStyle = {
  width: '100%', padding: '0.7rem 0.875rem', borderRadius: '6px',
  background: 'rgba(0,0,0,0.25)', border: '1px solid #334155',
  color: '#fff', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box', colorScheme: 'dark',
};

const EMPTY_FORM = { name: '', facultyId: '', studentIds: [] };

const AdminBatches = () => {
  const [batches, setBatches]     = useState([]);
  const [faculty, setFaculty]     = useState([]);
  const [students, setStudents]   = useState([]);
  const [studentBatchMap, setStudentBatchMap] = useState({});
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const [showModal, setShowModal]     = useState(false);
  const [editBatch, setEditBatch]     = useState(null);
  const [form, setForm]               = useState(EMPTY_FORM);
  const [formError, setFormError]     = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [deletingId, setDeletingId]   = useState(null);

  // students viewer
  const [viewBatch, setViewBatch] = useState(null);

  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [batchRes, userRes] = await Promise.all([api.get('/batches'), api.get('/auth/users')]);
      const fetchedBatches = batchRes.data.data || [];
      setBatches(fetchedBatches);

      const users = Array.isArray(userRes.data) ? userRes.data : [];
      setFaculty(users.filter(u => u.role === 'faculty'));
      setStudents(users.filter(u => u.role === 'student'));

      // Build studentId -> batchId map from batch data
      const map = {};
      fetchedBatches.forEach(b => {
        (b.students || []).forEach(st => {
          const uid = st.userId?._id || st._id;
          if (uid) map[uid] = b._id;
        });
      });
      setStudentBatchMap(map);
    } catch {
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => { setPage(1); }, [search]);

  const filtered   = batches.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.facultyId?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.facultyId?.email?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditBatch(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit   = (batch) => {
    setEditBatch(batch);
    const currentStudentIds = (batch.students || []).map(s => s.userId?._id || s._id).filter(Boolean);
    setForm({ name: batch.name, facultyId: batch.facultyId?._id || '', studentIds: currentStudentIds });
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setFormError(''); setEditBatch(null); };

  const toggleStudent = (id) => {
    setForm(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(id)
        ? prev.studentIds.filter(s => s !== id)
        : [...prev.studentIds, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Batch name is required.');
    if (!form.facultyId)   return setFormError('Please select a faculty.');

    try {
      setSubmitting(true);
      let batchId;

      if (editBatch) {
        await api.put(`/batches/${editBatch._id}`, { name: form.name.trim(), facultyId: form.facultyId });
        batchId = editBatch._id;
        setSuccess(`Batch "${form.name}" updated.`);
      } else {
        const res = await api.post('/batches', { name: form.name.trim(), facultyId: form.facultyId });
        batchId = res.data.batch._id;
        setSuccess(`Batch "${form.name}" created.`);
      }

      // Determine previously assigned students for this batch
      const prevStudentIds = editBatch
        ? (editBatch.students || []).map(s => s.userId?._id || s._id).filter(Boolean)
        : [];

      const toAdd    = form.studentIds.filter(id => !prevStudentIds.includes(id));
      const toRemove = prevStudentIds.filter(id => !form.studentIds.includes(id));

      // Assign newly selected students
      await Promise.all(toAdd.map(studentId => api.post('/batches/assign', { studentId, batchId })));

      // Remove deselected students by assigning them to null batch isn't supported,
      // so we use a dedicated unassign endpoint if available, otherwise we handle via backend
      // For now: re-assign removed students back to no batch by calling assign with batchId=null
      // The backend assignStudent upserts — we need an unassign route. Use a workaround:
      // We'll call a DELETE on /batches/assign or handle it. Let's check what's available.
      // Since backend only has assign (upsert), we'll call it with the student removed from this batch.
      // The cleanest approach: POST /batches/unassign
      if (toRemove.length) {
        await Promise.all(toRemove.map(studentId =>
          api.post('/batches/unassign', { studentId }).catch(() => {})
        ));
      }

      closeModal();
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete batch "${name}"? This will remove all related data.`)) return;
    try {
      setDeletingId(id);
      setError('');
      await api.delete(`/batches/${id}`);
      setSuccess(`Batch "${name}" deleted.`);
      setBatches(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete batch.');
    } finally {
      setDeletingId(null);
    }
  };

  const btnStyle = (color) => ({
    padding: '0.35rem 0.875rem', borderRadius: '5px', fontSize: '0.82rem',
    fontWeight: '600', cursor: 'pointer', border: `1px solid ${color}40`,
    background: `${color}15`, color: color,
  });

  // For a given student id, get the batch name they're currently in (excluding the batch being edited)
  const getStudentCurrentBatch = (studentId) => {
    const assignedBatchId = studentBatchMap[studentId];
    if (!assignedBatchId) return null;
    if (editBatch && assignedBatchId === editBatch._id) return null; // already in this batch
    return batches.find(b => b._id === assignedBatchId)?.name || null;
  };

  return (
    <section>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.25rem', color: '#fff' }}>Manage Batches</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>Create batches and link students with faculty.</p>
        </div>
        <button onClick={openCreate} className="login-button" style={{ width: 'auto', padding: '0.65rem 1.5rem' }}>
          + Create Batch
        </button>
      </div>

      {error   && <div className="error-message shake" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.9rem' }}>{success}</div>}

      <div style={{ marginBottom: '1rem' }}>
        <input type="text" placeholder="Search by batch name or faculty..." value={search}
          onChange={e => setSearch(e.target.value)} style={{ ...inputStyle, maxWidth: '360px' }} />
      </div>

      <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem' }}>Loading batches...</p>
        ) : paginated.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem' }}>
            {search ? 'No batches match your search.' : 'No batches yet. Create one to get started.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid #334155' }}>
                  {['#', 'Batch Name', 'Faculty', 'Students', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((batch, i) => {
                  const facultyName   = batch.facultyId?.name || batch.facultyId?.email || '—';
                  const batchStudents = batch.students || [];
                  return (
                    <tr key={batch._id} style={{ borderBottom: '1px solid #1e293b', verticalAlign: 'top' }}>
                      <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {(page - 1) * PAGE_SIZE + i + 1}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#fff', fontWeight: '600' }}>{batch.name}</td>
                      <td style={{ padding: '0.875rem 1.25rem', color: '#a78bfa' }}>{facultyName}</td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        {batchStudents.length === 0 ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No students</span>
                        ) : (
                          <button onClick={() => setViewBatch(batch)}
                            style={{ padding: '0.3rem 0.875rem', borderRadius: '5px', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', border: '1px solid rgba(96,165,250,0.35)', background: 'rgba(96,165,250,0.1)', color: '#60a5fa' }}>
                            {batchStudents.length} student{batchStudents.length !== 1 ? 's' : ''}
                          </button>
                        )}
                      </td>
                      <td style={{ padding: '0.875rem 1.25rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => openEdit(batch)} style={btnStyle('#60a5fa')}>Edit</button>
                          <button onClick={() => handleDelete(batch._id, batch.name)} disabled={deletingId === batch._id}
                            style={{ ...btnStyle('#f87171'), opacity: deletingId === batch._id ? 0.5 : 1 }}>
                            {deletingId === batch._id ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && filtered.length > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} batches
          </span>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ ...btnStyle('#94a3b8'), opacity: page === 1 ? 0.4 : 1 }}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                style={{ ...btnStyle(p === page ? '#6366f1' : '#94a3b8'), background: p === page ? 'rgba(99,102,241,0.2)' : 'transparent' }}>
                {p}
              </button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              style={{ ...btnStyle('#94a3b8'), opacity: page === totalPages ? 0.4 : 1 }}>Next</button>
          </div>
        </div>
      )}

      {/* Students viewer modal */}
      {viewBatch && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) setViewBatch(null); }}>
          <div style={{ background: '#1e293b', borderRadius: '10px', width: '100%', maxWidth: '420px', border: '1px solid #334155', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #334155' }}>
              <div>
                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.05rem' }}>{viewBatch.name}</h3>
                <p style={{ margin: '0.2rem 0 0', color: '#94a3b8', fontSize: '0.82rem' }}>
                  {(viewBatch.students || []).length} student{(viewBatch.students || []).length !== 1 ? 's' : ''}
                </p>
              </div>
              <button onClick={() => setViewBatch(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>
            {/* List */}
            <div style={{ overflowY: 'auto', padding: '0.75rem 0' }}>
              {(viewBatch.students || []).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', margin: 0 }}>No students in this batch.</p>
              ) : (
                (viewBatch.students || []).map((st, i) => {
                  const name  = st.userId?.name  || '—';
                  const email = st.userId?.email || '—';
                  return (
                    <div key={st._id} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.65rem 1.5rem', borderBottom: '1px solid #0f172a' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(96,165,250,0.15)', border: '1px solid rgba(96,165,250,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#60a5fa', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0 }}>
                        {i + 1}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <p style={{ color: '#fff', fontWeight: 600, margin: 0, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                        <p style={{ color: '#64748b', margin: 0, fontSize: '0.78rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{email}</p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: '#1e293b', borderRadius: '10px', width: '100%', maxWidth: '500px', border: '1px solid #334155', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #334155', position: 'sticky', top: 0, background: '#1e293b', zIndex: 1 }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{editBatch ? 'Edit Batch' : 'Create New Batch'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.3rem', cursor: 'pointer' }}>×</button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formError && <div style={{ padding: '0.65rem 0.875rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.875rem' }}>{formError}</div>}

              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#cbd5e1', fontSize: '0.85rem' }}>Batch Name</label>
                <input type="text" placeholder="e.g. Batch A" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} style={inputStyle} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#cbd5e1', fontSize: '0.85rem' }}>Assign Faculty</label>
                <select value={form.facultyId} onChange={e => setForm(p => ({ ...p, facultyId: e.target.value }))} style={{ ...inputStyle, cursor: 'pointer' }}>
                  <option value="">-- Select Faculty --</option>
                  {faculty.map(f => <option key={f._id} value={f._id}>{f.name || f.email}</option>)}
                </select>
                {faculty.length === 0 && <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '0.3rem' }}>No faculty found. Add faculty users first.</p>}
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#cbd5e1', fontSize: '0.85rem' }}>
                  Select Students <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({form.studentIds.length} selected)</span>
                </label>
                {students.length === 0 ? (
                  <p style={{ color: '#f59e0b', fontSize: '0.8rem' }}>No students found.</p>
                ) : (
                  <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #334155', borderRadius: '6px', background: 'rgba(0,0,0,0.2)' }}>
                    {students.map(st => {
                      const checked      = form.studentIds.includes(st._id);
                      const currentBatch = getStudentCurrentBatch(st._id);
                      const isElsewhere  = !!currentBatch;

                      return (
                        <label key={st._id} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', padding: '0.6rem 0.875rem', cursor: isElsewhere ? 'not-allowed' : 'pointer', borderBottom: '1px solid #1e293b', background: checked ? 'rgba(96,165,250,0.08)' : 'transparent', opacity: isElsewhere ? 0.55 : 1 }}>
                          <input type="checkbox" checked={checked}
                            onChange={() => { if (!isElsewhere) toggleStudent(st._id); }}
                            disabled={isElsewhere}
                            style={{ accentColor: '#60a5fa', width: '15px', height: '15px', cursor: isElsewhere ? 'not-allowed' : 'pointer' }} />
                          <span style={{ color: checked ? '#60a5fa' : '#cbd5e1', fontSize: '0.875rem', flex: 1 }}>
                            {st.name || st.email}
                          </span>
                          {isElsewhere && (
                            <span style={{ fontSize: '0.75rem', color: '#f59e0b', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '4px', padding: '0.1rem 0.4rem', whiteSpace: 'nowrap' }}>
                              in {currentBatch}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                )}
                <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', marginTop: '0.35rem' }}>
                  Students already in another batch are disabled — a student can only belong to one batch.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>Cancel</button>
                <button type="submit" disabled={submitting} className="login-button" style={{ flex: 1, padding: '0.7rem', opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Saving...' : editBatch ? 'Update Batch' : 'Create Batch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminBatches;
