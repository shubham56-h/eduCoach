import { useState, useEffect } from 'react';
import api from '../services/api';

const PAGE_SIZE = 5;

const roleBadge = (role) => {
  const map = {
    student: { color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', border: 'rgba(96,165,250,0.25)' },
    faculty: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', border: 'rgba(167,139,250,0.25)' },
    admin:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
  };
  const s = map[role] || map.student;
  return (
    <span style={{ padding: '0.2rem 0.65rem', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: s.color, background: s.bg, border: `1px solid ${s.border}`, textTransform: 'capitalize' }}>
      {role}
    </span>
  );
};

const inputStyle = {
  width: '100%', padding: '0.7rem 0.875rem', borderRadius: '6px',
  background: 'rgba(0,0,0,0.25)', border: '1px solid #334155',
  color: '#fff', outline: 'none', fontSize: '0.9rem', boxSizing: 'border-box',
};

const EMPTY_FORM = { name: '', email: '', password: '', role: 'student' };

const AdminUsers = () => {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser]   = useState(null); // null = create, object = edit
  const [form, setForm]           = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // search + pagination
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/users');
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // reset page when search changes
  useEffect(() => { setPage(1); }, [search]);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => { setEditUser(null); setForm(EMPTY_FORM); setFormError(''); setShowModal(true); };
  const openEdit   = (user) => {
    setEditUser(user);
    setForm({ name: user.name || '', email: user.email, password: '', role: user.role });
    setFormError('');
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setFormError(''); setEditUser(null); };

  const handleFormChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Name is required.');
    if (!form.email.trim()) return setFormError('Email is required.');
    if (!editUser && form.password.length < 6) return setFormError('Password must be at least 6 characters.');

    try {
      setSubmitting(true);
      if (editUser) {
        // Update — send only changed fields
        const payload = { name: form.name, email: form.email, role: form.role };
        if (form.password) payload.password = form.password;
        await api.put(`/auth/users/${editUser._id}`, payload);
        setSuccess(`User "${form.name}" updated.`);
      } else {
        await api.post('/auth/create-user', form);
        setSuccess(`User "${form.name}" created.`);
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      setDeletingId(id);
      setError('');
      await api.delete(`/auth/users/${id}`);
      setSuccess(`User "${name}" deleted.`);
      setUsers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    } finally {
      setDeletingId(null);
    }
  };

  const btnStyle = (color) => ({
    padding: '0.35rem 0.875rem', borderRadius: '5px', fontSize: '0.82rem',
    fontWeight: '600', cursor: 'pointer', border: `1px solid ${color}40`,
    background: `${color}15`, color: color,
  });

  return (
    <section>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', margin: '0 0 0.25rem', color: '#fff' }}>Manage Users</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>Create and manage student and faculty accounts.</p>
        </div>
        <button onClick={openCreate} className="login-button" style={{ width: 'auto', padding: '0.65rem 1.5rem' }}>
          + Add User
        </button>
      </div>

      {/* Alerts */}
      {error   && <div className="error-message shake" style={{ marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ marginBottom: '1rem', padding: '0.75rem 1rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '6px', border: '1px solid rgba(16,185,129,0.2)', fontSize: '0.9rem' }}>{success}</div>}

      {/* Search */}
      <div style={{ marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, maxWidth: '360px' }}
        />
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid #334155', overflow: 'hidden' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem' }}>Loading users...</p>
        ) : paginated.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2.5rem' }}>
            {search ? 'No users match your search.' : 'No users found. Add one to get started.'}
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.2)', borderBottom: '1px solid #334155' }}>
                  {['#', 'Name', 'Email', 'Role', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '0.875rem 1.25rem', color: '#94a3b8', fontWeight: '600', fontSize: '0.85rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((user, i) => (
                  <tr key={user._id} style={{ borderBottom: '1px solid #1e293b' }}>
                    <td style={{ padding: '0.875rem 1.25rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {(page - 1) * PAGE_SIZE + i + 1}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#fff', fontWeight: '500' }}>
                      {user.name || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.875rem 1.25rem', color: '#cbd5e1', fontSize: '0.9rem' }}>{user.email}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>{roleBadge(user.role)}</td>
                    <td style={{ padding: '0.875rem 1.25rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={() => openEdit(user)} style={btnStyle('#60a5fa')}>Edit</button>
                        <button
                          onClick={() => handleDelete(user._id, user.name || user.email)}
                          disabled={deletingId === user._id}
                          style={{ ...btnStyle('#f87171'), opacity: deletingId === user._id ? 0.5 : 1 }}
                        >
                          {deletingId === user._id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > PAGE_SIZE && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} users
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

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
          onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div style={{ background: '#1e293b', borderRadius: '10px', width: '100%', maxWidth: '440px', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: '1px solid #334155' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem' }}>{editUser ? 'Edit User' : 'Add New User'}</h3>
              <button onClick={closeModal} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: '1.3rem', cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formError && <div style={{ padding: '0.65rem 0.875rem', background: 'rgba(239,68,68,0.1)', color: '#f87171', borderRadius: '6px', border: '1px solid rgba(239,68,68,0.2)', fontSize: '0.875rem' }}>{formError}</div>}

              {[
                { label: 'Full Name', name: 'name', type: 'text', placeholder: 'e.g. John Doe' },
                { label: 'Email', name: 'email', type: 'email', placeholder: 'e.g. john@example.com' },
                { label: editUser ? 'New Password (leave blank to keep)' : 'Password', name: 'password', type: 'password', placeholder: 'Min. 6 characters' },
              ].map(field => (
                <div key={field.name}>
                  <label style={{ display: 'block', marginBottom: '0.35rem', color: '#cbd5e1', fontSize: '0.85rem' }}>{field.label}</label>
                  <input type={field.type} name={field.name} placeholder={field.placeholder}
                    value={form[field.name]} onChange={handleFormChange} style={inputStyle} />
                </div>
              ))}

              <div>
                <label style={{ display: 'block', marginBottom: '0.35rem', color: '#cbd5e1', fontSize: '0.85rem' }}>Role</label>
                <select name="role" value={form.role} onChange={handleFormChange} style={{ ...inputStyle, cursor: 'pointer', colorScheme: 'dark' }}>
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                <button type="button" onClick={closeModal} style={{ flex: 1, padding: '0.7rem', borderRadius: '6px', cursor: 'pointer', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', fontWeight: '600', fontSize: '0.9rem' }}>Cancel</button>
                <button type="submit" disabled={submitting} className="login-button" style={{ flex: 1, padding: '0.7rem', opacity: submitting ? 0.6 : 1 }}>
                  {submitting ? 'Saving...' : editUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default AdminUsers;
