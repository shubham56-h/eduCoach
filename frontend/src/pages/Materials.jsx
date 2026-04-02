import { useState, useEffect } from 'react';
import api from '../services/api';

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const res = await api.get('/materials/my-materials');
        setMaterials(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        const msg = err.response?.data?.message || '';
        setError(msg || 'Failed to load materials. Make sure the backend is running.');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getFileExt = (url) => {
    if (!url) return 'FILE';
    return url.split('.').pop().toUpperCase();
  };

  const extColor = (ext) => {
    const map = { PDF: '#ef4444', DOCX: '#3b82f6', DOC: '#3b82f6', PNG: '#10b981', JPG: '#10b981', JPEG: '#10b981', ZIP: '#f59e0b', PPTX: '#f97316', PPT: '#f97316' };
    return map[ext] || '#8b5cf6';
  };

  return (
    <div>
      <section style={{ textAlign: 'left' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: '#fff' }}>Study Materials</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Files uploaded by your faculty for your batch.</p>
        </div>

        {loading && (
          <p style={{ color: 'var(--text-muted)', padding: '1rem 0' }}>Loading materials...</p>
        )}

        {error && !loading && (
          <div className="error-message shake" style={{ marginBottom: '1.5rem' }}>{error}</div>
        )}

        {!loading && !error && materials.length === 0 && (
          <div style={{
            background: 'var(--bg-card)', borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '3rem', textAlign: 'center',
          }}>
            <p style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem' }}>No materials uploaded yet.</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>
              If you are not assigned to a batch, contact your admin.
            </p>
          </div>
        )}

        {!loading && !error && materials.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {materials.map((mat) => {
              const ext = getFileExt(mat.fileUrl);
              const color = extColor(ext);
              const downloadUrl = `${api.defaults.baseURL.replace('/api', '')}${mat.fileUrl}`;
              return (
                <div key={mat._id} style={{
                  background: 'var(--bg-card)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255,255,255,0.05)',
                  padding: '1.25rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  boxShadow: '0 4px 15px -5px rgba(0,0,0,0.4)',
                }}>
                  {/* File type badge */}
                  <div style={{
                    minWidth: '52px', height: '52px',
                    background: `${color}18`,
                    border: `1px solid ${color}40`,
                    borderRadius: '10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.7rem', fontWeight: '700', color: color, letterSpacing: '0.05em',
                  }}>
                    {ext}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 0.25rem', color: '#fff', fontWeight: '600', fontSize: '1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {mat.title}
                    </p>
                    {mat.description && (
                      <p style={{ margin: '0 0 0.25rem', color: '#94a3b8', fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {mat.description}
                      </p>
                    )}
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      {mat.facultyId?.name || mat.facultyId?.email || 'Faculty'} &middot; {formatDate(mat.createdAt)}
                    </p>
                  </div>

                  {/* Download button */}
                  <a
                    href={downloadUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '0.5rem 1.25rem',
                      borderRadius: '8px',
                      background: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.3)',
                      color: '#818cf8',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.28)'; }}
                    onMouseOut={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; }}
                  >
                    Download
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Materials;
