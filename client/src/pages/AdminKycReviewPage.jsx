import React, { useEffect, useMemo, useState } from 'react';
import Layout from '../layouts/Layout';
import { apiFetch } from '../utils/api';
import './AdminKycReviewPage.css';

const AdminKycReviewPage = ({ user, onLogout }) => {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState(null); // {type, message}
  const [rejecting, setRejecting] = useState({});
  const [approving, setApproving] = useState({});
  const [reasons, setReasons] = useState({});
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null); // {url, user}

  const load = async () => {
    setLoading(true);
    const res = await apiFetch('/kyc/admin/pending');
    if (res.ok) {
      const data = await res.json();
      setPending(data.users || []);
    } else if (res.status === 403) {
      setAlertMsg({ type: 'danger', message: 'Admins only' });
    } else {
      setAlertMsg({ type: 'danger', message: 'Failed to load pending KYC' });
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return pending;
    return pending.filter(u =>
      u.username?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    );
  }, [pending, search]);

  const approve = async (userId) => {
    setApproving((a) => ({ ...a, [userId]: true }));
    const res = await apiFetch(`/kyc/admin/${userId}/approve`, { method: 'POST' });
    if (res.ok) {
      setAlertMsg({ type: 'success', message: 'User approved successfully' });
      setPending((prev) => prev.filter((u) => u._id !== userId));
    } else {
      const data = await res.json().catch(() => ({}));
      setAlertMsg({ type: 'danger', message: data.message || 'Failed to approve' });
    }
    setApproving((a) => ({ ...a, [userId]: false }));
  };

  const reject = async (userId) => {
    setRejecting((r) => ({ ...r, [userId]: true }));
    const reason = reasons[userId]?.trim() || 'Incomplete/invalid documents';
    const res = await apiFetch(`/kyc/admin/${userId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) {
      setAlertMsg({ type: 'success', message: 'Rejected ❌' });
      setPending((prev) => prev.filter((u) => u._id !== userId));
    } else {
      const data = await res.json().catch(() => ({}));
      setAlertMsg({ type: 'danger', message: data.message || 'Failed to reject' });
    }
    setRejecting((r) => ({ ...r, [userId]: false }));
  };

  if (user?.role !== 'admin') {
    return (
      <Layout user={user} onLogout={onLogout}>
        <div className="container py-4"><div className="alert alert-danger">Admins only</div></div>
      </Layout>
    );
  }

  const headerCount = loading ? '' : `(${filtered.length})`;

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="container py-4 admin-kyc-page">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
          <div className="d-flex align-items-center gap-2">
            <i className="fa-solid fa-shield-halved text-primary fs-3"></i>
            <h1 className="h3 m-0">Pending Owner KYC <span className="text-muted">{headerCount}</span></h1>
          </div>
          <div className="d-flex gap-2">
            <input className="form-control" style={{ minWidth: 260 }} placeholder="Search by name or email" value={search} onChange={(e) => setSearch(e.target.value)} />
            <button className="btn btn-outline-secondary" onClick={load}><i className="fa-solid fa-rotate"></i></button>
          </div>
        </div>

        {alertMsg && (
          <div className={`alert alert-${alertMsg.type} alert-dismissible`} role="alert">
            {alertMsg.message}
            <button type="button" className="btn-close" onClick={() => setAlertMsg(null)}></button>
          </div>
        )}

        {loading && (
          <div className="row g-3">
            {[...Array(6)].map((_, i) => (
              <div className="col-12 col-md-6 col-lg-4" key={i}>
                <div className="card shimmer h-100" style={{ height: 280 }} />
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-muted py-5">No pending verifications.</div>
        )}

        <div className="row g-3">
          {filtered.map((u) => (
            <div className="col-12 col-md-6 col-lg-4" key={u._id}>
              <div className="card kyc-card h-100">
                <div className="card-body d-flex flex-column">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <img className="rounded-circle shadow-sm" alt={u.username} width={44} height={44}
                         src={`https://ui-avatars.com/api/?name=${encodeURIComponent(u.username || 'U')}&background=random`} />
                    <div>
                      <div className="fw-semibold">{u.username}</div>
                      <div className="small text-muted">{u.email}</div>
                    </div>
                  </div>

                  {u.kycDocs?.length > 0 && (
                    <div className="d-flex gap-2 flex-wrap mb-3">
                      {u.kycDocs.map((d, idx) => (
                        <img key={idx} src={d.url} alt={`doc-${idx}`} className="doc-thumb" onClick={() => setPreview({ url: d.url, user: u })} />
                      ))}
                    </div>
                  )}

                  <div className="mt-auto">
                    <div className="mb-2">
                      <textarea className="form-control" rows={2} placeholder="Reason (if rejecting)"
                                value={reasons[u._id] || ''}
                                onChange={(e) => setReasons((r) => ({ ...r, [u._id]: e.target.value }))} />
                    </div>
                    <div className="d-flex gap-2">
                      <button className="btn btn-success" onClick={() => approve(u._id)} disabled={!!approving[u._id]}>
                        {approving[u._id] ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1"></span>
                            Approving...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-check me-1"></i> Approve
                          </>
                        )}
                      </button>
                      <button className="btn btn-outline-danger" onClick={() => reject(u._id)} disabled={!!rejecting[u._id]}>
                        {rejecting[u._id] ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-1"></span>
                            Rejecting...
                          </>
                        ) : (
                          <>
                            <i className="fa-solid fa-xmark me-1"></i> Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {preview && (
        <div className="modal fade show d-block" tabIndex="-1" role="dialog" onClick={() => setPreview(null)}>
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Document Preview - {preview.user?.username}</h5>
                <button type="button" className="btn-close" onClick={() => setPreview(null)}></button>
              </div>
              <div className="modal-body text-center">
                <img src={preview.url} alt="doc" className="img-fluid rounded" />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setPreview(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminKycReviewPage;
