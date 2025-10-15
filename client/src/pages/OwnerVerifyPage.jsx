import React, { useEffect, useState } from 'react';
import Layout from '../layouts/Layout';
import { apiFetch } from '../utils/api';

const OwnerVerifyPage = ({ user, onLogout }) => {
  const [status, setStatus] = useState(null); // { kycStatus, kycNotes, kycDocs }
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const loadStatus = async () => {
    const res = await apiFetch('/kyc/owner/status');
    if (res.ok) {
      const data = await res.json();
      setStatus(data);
    }
  };

  useEffect(() => { loadStatus(); }, []);

  const onFileChange = (e) => {
    setFiles(Array.from(e.target.files || []));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!files.length) {
      setToast({ type: 'error', message: 'Please select at least one Aadhaar image.' });
      return;
    }
    setSubmitting(true);
    const form = new FormData();
    files.forEach((f) => form.append('aadhaar', f));
    const res = await apiFetch('/kyc/owner/upload', { method: 'POST', body: form });
    const data = await res.json();
    if (res.ok) {
      setToast({ type: 'success', message: 'KYC submitted for review.' });
      setFiles([]);
      await loadStatus();
    } else {
      setToast({ type: 'error', message: data.message || 'Submission failed' });
    }
    setSubmitting(false);
  };

  const Badge = ({ s }) => {
    const map = { unverified: 'secondary', pending: 'warning', verified: 'success', rejected: 'danger' };
    return <span className={`badge bg-${map[s] || 'secondary'}`}>{s}</span>;
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      {toast && (
        <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} m-3`} role="alert">
          {toast.message}
        </div>
      )}
      <div className="container py-4">
        <h1>Owner Verification</h1>
        <p className="text-muted">Upload your Aadhaar (front/back). JPG/PNG up to 5 MB each.</p>

        <div className="mb-3">
          <strong>Status:</strong> {status?.kycStatus ? <Badge s={status.kycStatus} /> : '—'}
        </div>
        {status?.kycNotes && (
          <div className="alert alert-warning">{status.kycNotes}</div>
        )}

        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Aadhaar Images</label>
            <input type="file" multiple accept="image/*" className="form-control" onChange={onFileChange} />
            {files.length > 0 && <small className="text-muted">{files.length} file(s) selected</small>}
          </div>
          <button className="btn btn-primary" disabled={submitting || (status?.kycStatus === 'pending')}>{submitting ? 'Submitting...' : 'Submit for verification'}</button>
        </form>

        {status?.kycDocs?.length > 0 && (
          <div className="mt-4">
            <h5>Uploaded Documents</h5>
            <div className="d-flex gap-3 flex-wrap">
              {status.kycDocs.map((d, idx) => (
                <div key={idx} className="card" style={{ width: 220 }}>
                  <img src={d.url} className="card-img-top" alt={`doc-${idx}`} />
                  <div className="card-body">
                    <div className="small text-muted">{d.type.toUpperCase()}</div>
                    <div className="small">{new Date(d.uploadedAt).toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default OwnerVerifyPage;
