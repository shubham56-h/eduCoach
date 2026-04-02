import { useState, useEffect } from 'react';
import api from '../services/api';

const FacultyMaterial = () => {
  const [batch, setBatch]           = useState(null);
  const [materials, setMaterials]   = useState([]);
  const [title, setTitle]           = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile]             = useState(null);

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState('');

  const fetchMaterials = async (batchId) => {
    try {
      const res = await api.get(`/materials/batch/${batchId}`);
      setMaterials(Array.isArray(res.data) ? res.data : []);
    } catch { /* non-critical */ }
  };

  useEffect(() => {
    api.get('/batches')
      .then(async res => {
        const batches = res.data.data || res.data || [];
        if (!batches.length) return;
        const b = batches[0];
        setBatch(b);
        await fetchMaterials(b._id);
      })
      .catch(() => setError('Failed to load batch.'))
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!batch) return setError('No batch assigned to you.');
    if (!title) return setError('Please provide a title.');
    if (!file)  return setError('Please choose a file to upload.');

    try {
      setSubmitting(true);
      setError(null);
      setSuccess('');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('batchId', batch._id);
      formData.append('file', file);

      await api.post('/materials', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

      setSuccess('Material uploaded successfully.');
      setTitle('');
      setDescription('');
      setFile(null);
      document.getElementById('file-upload').value = '';
      await fetchMaterials(batch._id);
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading file.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      setDeletingId(id);
      await api.delete(`/materials/${id}`);
      setMaterials(prev => prev.filter(m => m._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete material.');
    } finally {
      setDeletingId(null);
    }
  };

  const fieldStyle = {
    width: '100%', padding: '1rem', borderRadius: '10px',
    background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff', outline: 'none', fontSize: '0.95rem', boxSizing: 'border-box',
  };

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: '2rem 0' }}>Loading...</p>;

  return (
    <section style={{ animation: 'slideUp 0.4s ease forwards' }}>
      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem 0', color: '#fff' }}>Study Materials</h2>
        {batch && (
          <p style={{ color: 'var(--text-muted)', fontSize: '1.05rem' }}>
            Batch: <span style={{ color: '#60a5fa', fontWeight: 600 }}>{batch.name}</span>
          </p>
        )}
      </div>

      {error   && <div className="error-message shake" style={{ marginBottom: '1.5rem', maxWidth: '600px' }}>{error}</div>}
      {success && (
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16,185,129,0.1)', color: '#10b981', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', maxWidth: '600px' }}>
          {success}
        </div>
      )}

      {!batch ? (
        <p style={{ color: 'var(--text-muted)' }}>No batch assigned to you yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

          {/* Upload form */}
          <div style={{ background: 'var(--bg-card)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', padding: '2.5rem', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.5)', maxWidth: '600px' }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: 500 }}>Resource Title</label>
                <input type="text" placeholder="e.g. Chapter 1: Differential Equations" value={title} onChange={e => setTitle(e.target.value)} style={fieldStyle} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: 500 }}>Description (Optional)</label>
                <textarea placeholder="Provide a brief summary..." value={description} onChange={e => setDescription(e.target.value)} rows="3" style={{ ...fieldStyle, resize: 'vertical' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e1', fontWeight: 500 }}>Attach File</label>
                <div style={{ border: '2px dashed rgba(255,255,255,0.1)', padding: '2rem', borderRadius: '10px', textAlign: 'center', background: 'rgba(0,0,0,0.1)', position: 'relative' }}>
                  <input type="file" id="file-upload" onChange={handleFileChange}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }} />
                  <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>+</span>
                  <p style={{ color: '#fff', margin: '0 0 0.25rem', fontWeight: 500 }}>
                    {file ? file.name : 'Drag & Drop or Click to browse'}
                  </p>
                  <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.85rem' }}>
                    {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'Supports PDF, DOCX, PNG, ZIP'}
                  </p>
                </div>
              </div>
              <button type="submit" disabled={submitting} className="login-button"
                style={{ width: '100%', padding: '1rem', opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}>
                {submitting ? 'Uploading...' : 'Upload Material'}
              </button>
            </form>
          </div>

          {/* Uploaded materials list */}
          {materials.length > 0 && (
            <div style={{ maxWidth: '600px' }}>
              <p style={{ color: '#cbd5e1', fontWeight: 600, marginBottom: '0.75rem' }}>
                Uploaded ({materials.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {materials.map(m => (
                  <div key={m._id} style={{ background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ color: '#fff', fontWeight: 600, margin: '0 0 0.2rem', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.title}</p>
                      {m.description && <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.82rem' }}>{m.description}</p>}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                      <a href={`${api.defaults.baseURL.replace('/api', '')}${m.fileUrl}`} target="_blank" rel="noreferrer"
                        style={{ padding: '0.35rem 0.875rem', borderRadius: '5px', fontSize: '0.82rem', fontWeight: 600, border: '1px solid rgba(96,165,250,0.4)', background: 'rgba(96,165,250,0.15)', color: '#60a5fa', textDecoration: 'none' }}>
                        View
                      </a>
                      <button
                        onClick={() => handleDelete(m._id)}
                        disabled={deletingId === m._id}
                        style={{ padding: '0.35rem 0.875rem', borderRadius: '5px', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', border: '1px solid rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.1)', color: '#f87171', opacity: deletingId === m._id ? 0.5 : 1 }}>
                        {deletingId === m._id ? '...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default FacultyMaterial;
