import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Dashboard.css';

const STATUS_LABELS = {
  submitted: 'Submitted', assigned: 'Assigned', working: 'Working',
  acceptance_pending: 'Acceptance Pending', completed: 'Completed', flagged: 'Flagged'
};

const HeadDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('complaints');
  const [complaints, setComplaints] = useState([]);
  const [flags, setFlags] = useState([]);

  // view user info modal
  const [viewModal, setViewModal] = useState(null);
  const [viewReason, setViewReason] = useState('');
  const [viewedInfo, setViewedInfo] = useState(null);

  // message modal
  const [msgModal, setMsgModal] = useState(null); // { type: 'authority'|'citizen', recipientId, complaintId, name }
  const [msgContent, setMsgContent] = useState('');
  const [msgSending, setMsgSending] = useState(false);
  const [msgSuccess, setMsgSuccess] = useState('');

  useEffect(() => {
    API.get('/head/complaints').then(r => setComplaints(r.data));
    API.get('/head/flags').then(r => setFlags(r.data));
  }, []);

  const handleViewInfo = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/head/view-user-info', { complaintId: viewModal, reason: viewReason });
      setViewedInfo(data);
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleResolveFlag = async (id) => {
    try {
      await API.post(`/head/flags/${id}/resolve`);
      setFlags(prev => prev.map(f => f._id === id ? { ...f, resolved: true } : f));
    } catch (e) { alert('Error'); }
  };

  const openViewModal = (complaintId) => {
    setViewModal(complaintId);
    setViewReason('');
    setViewedInfo(null);
  };

  const openMsgModal = (type, recipientId, complaintId, name) => {
    setMsgModal({ type, recipientId, complaintId, name });
    setMsgContent('');
    setMsgSuccess('');
  };

  const handleSendMsg = async (e) => {
    e.preventDefault();
    setMsgSending(true);
    try {
      if (msgModal.type === 'authority') {
        await API.post('/messages/to-authority', {
          recipientId: msgModal.recipientId,
          complaintId: msgModal.complaintId,
          content: msgContent
        });
      } else {
        await API.post('/messages/to-citizen', {
          complaintId: msgModal.complaintId,
          content: msgContent
        });
      }
      setMsgSuccess('Message sent successfully. Email notification has been sent.');
      setMsgContent('');
    } catch (e) {
      alert(e.response?.data?.message || 'Failed to send message');
    } finally {
      setMsgSending(false);
    }
  };

  const activeFlags = flags.filter(f => !f.resolved);
  const resolvedFlags = flags.filter(f => f.resolved);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="container">
          <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
            <span style={{fontSize:'3rem'}}>🏛️</span>
            <div>
              <h1>Main Head Dashboard</h1>
              <p>Jurisdiction: {user.taluk}, {user.district}, {user.state}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-num">{complaints.length}</div>
            <div className="stat-label">Total Issues</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{complaints.filter(c => c.status === 'completed').length}</div>
            <div className="stat-label">Resolved</div>
          </div>
          <div className="stat-card">
            <div className="stat-num">{complaints.filter(c => c.status === 'working').length}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card stat-alert">
            <div className="stat-num">{activeFlags.length}</div>
            <div className="stat-label">Active Flags</div>
          </div>
        </div>

        <div className="tabs">
          <button className={`tab ${tab === 'complaints' ? 'active' : ''}`} onClick={() => setTab('complaints')}>
            📋 All Issues ({complaints.length})
          </button>
          <button className={`tab ${tab === 'flags' ? 'active' : ''}`} onClick={() => setTab('flags')}>
            🚩 Flags {activeFlags.length > 0 && <span className="flag-count">{activeFlags.length}</span>}
          </button>
        </div>

        {tab === 'complaints' && (
          <div className="tab-content">
            <h2>All Issues — {user.district}</h2>
            {complaints.length === 0 ? <p className="empty">No issues in your jurisdiction.</p> : (
              <div className="head-issues-grid">
                {complaints.map(c => (
                  <div key={c._id} className="head-issue-card">
                    <div className="head-card-top">
                      <span className={`badge badge-${c.issueType}`}>
                        {c.issueType === 'garbage' ? '🗑️ Garbage' : '💡 Street Light'}
                      </span>
                      <span className={`status-badge status-${c.status}`}>{STATUS_LABELS[c.status]}</span>
                    </div>
                    {c.photo && (
                      <img src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/uploads/${c.photo}`} alt="Issue" className="head-card-photo" />
                    )}
                    <div className="head-card-body">
                      <div className="head-card-location">📍 {c.area}, {c.taluk}</div>
                      {c.note && <p className="head-card-note">{c.note}</p>}
                      <div className="head-card-meta">
                        <span>👍 {c.likes}</span>
                        <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="head-card-actions">
                        <button className="btn-view-info" onClick={() => openViewModal(c.complaintId)}>
                          👤 View Reporter
                        </button>
                        <button className="btn-msg" onClick={() => openMsgModal('citizen', null, c.complaintId, 'Citizen')}>
                          ✉️ Msg Citizen
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'flags' && (
          <div className="tab-content">
            <h2>Flagged Issues</h2>
            {activeFlags.length === 0 && resolvedFlags.length === 0 ? (
              <p className="empty">No flags raised.</p>
            ) : (
              <>
                {activeFlags.length > 0 && (
                  <>
                    <h3 className="section-sub">Active Flags</h3>
                    <div className="flag-detail-grid">
                    {activeFlags.map(f => (
                      <div key={f._id} className={`flag-detail-card flag-${f.type}`}>
                        <div className="flag-detail-top">
                          <span className={`flag-type-badge ${f.type}`}>
                            {f.type === 'user_ignored' ? '⏰ User Ignored Acceptance' : '❌ Authority Work Rejected'}
                          </span>
                          <span className="tracking-id">#{f.complaintId}</span>
                        </div>

                        <div className="flag-detail-body">
                          {/* Left */}
                          <div className="flag-detail-left">
                            {f.complaint?.photo && (
                              <img src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/uploads/${f.complaint.photo}`} alt="Issue" className="flag-detail-photo" />
                            )}
                            <div className="flag-detail-location">📍 {f.complaint?.area || ''}, {f.taluk}, {f.district}</div>
                            {f.complaint?.note && (
                              <div className="flag-detail-note"><strong>Issue Note:</strong> {f.complaint.note}</div>
                            )}
                            {f.rejectionNote && (
                              <div className="flag-detail-rejection"><strong>Rejection Reason:</strong> {f.rejectionNote}</div>
                            )}
                            {f.rejectionPhoto && (
                              <img src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/uploads/${f.rejectionPhoto}`} alt="Rejection proof" className="flag-detail-photo" />
                            )}
                            <div className="flag-detail-meta">
                              <span>👍 {f.complaint?.likes || 0} supports</span>
                              <span>Flagged: {new Date(f.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                          </div>

                          {/* Right */}
                          <div className="flag-detail-right">
                            {f.type === 'authority_rejected' && f.authorityId && (
                              <div className="flag-info-box">
                                <div className="flag-info-title">👷 Local Authority</div>
                                <div className="flag-info-row"><span>Name</span><strong>{f.authorityId.name}</strong></div>
                                <div className="flag-info-row"><span>Dept</span><strong>{f.authorityDept}</strong></div>
                                <div className="flag-info-row"><span>Email</span><strong>{f.authorityId.email}</strong></div>
                                {f.authorityId.phone && <div className="flag-info-row"><span>Phone</span><strong>{f.authorityId.phone}</strong></div>}
                                <button className="btn-msg mt-sm" onClick={() => openMsgModal('authority', f.authorityId._id, f.complaintId, f.authorityId.name)}>
                                  ✉️ Message Authority
                                </button>
                              </div>
                            )}
                            <div className="flag-info-box">
                              <div className="flag-info-title">👤 Reporter (Citizen)</div>
                              <p className="flag-reporter-note">View reporter info requires a logged reason.</p>
                              <div className="flag-action-btns">
                                <button className="btn-view-info" onClick={() => openViewModal(f.complaintId)}>👤 View Info</button>
                                <button className="btn-msg" onClick={() => openMsgModal('citizen', null, f.complaintId, 'Citizen')}>✉️ Message</button>
                              </div>
                            </div>
                            <button className="btn-resolve" onClick={() => handleResolveFlag(f._id)}>✔ Mark Resolved</button>
                          </div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </>
                )}
                {resolvedFlags.length > 0 && (
                  <>
                    <h3 className="section-sub">Resolved Flags</h3>
                    <div className="head-issues-grid">
                    {resolvedFlags.map(f => (
                      <div key={f._id} className="head-flag-card resolved">
                        <div className="head-card-top">
                          <span className="flag-type-badge resolved">✅ Resolved</span>
                          <span className="tracking-id">#{f.complaintId}</span>
                        </div>
                        <div className="head-card-body">
                          <div className="head-card-location">📍 {f.taluk}, {f.district}</div>
                        </div>
                      </div>
                    ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* View User Info Modal */}
      {viewModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>View Reporter Information</h3>
            <p className="modal-warning">⚠️ This action will be logged. Provide a valid reason.</p>
            {!viewedInfo ? (
              <form onSubmit={handleViewInfo}>
                <div className="form-group">
                  <label>Reason for viewing user information</label>
                  <textarea value={viewReason} onChange={e => setViewReason(e.target.value)} rows={3} required placeholder="e.g. Need to contact user regarding complaint #SB-..." />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-submit">View Information</button>
                  <button type="button" className="btn-cancel" onClick={() => setViewModal(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="user-info-revealed">
                <div className="info-row"><span>Name</span><strong>{viewedInfo.name}</strong></div>
                <div className="info-row"><span>Email</span><strong>{viewedInfo.email}</strong></div>
                <div className="info-row"><span>Phone</span><strong>{viewedInfo.phone || 'Not provided'}</strong></div>
                <p className="audit-note">This view has been recorded in the audit log.</p>
                <button className="btn-cancel" onClick={() => { setViewModal(null); setViewedInfo(null); }}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Message Modal */}
      {msgModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Send Message</h3>
            <p className="modal-to">
              To: <strong>{msgModal.type === 'citizen' ? 'Citizen (via Complaint)' : msgModal.name}</strong>
              {msgModal.complaintId && <span className="modal-complaint-ref"> — #{msgModal.complaintId}</span>}
            </p>
            {msgModal.type === 'citizen' && (
              <p className="modal-warning">ℹ️ Message will be sent to the citizen without revealing their identity to you.</p>
            )}
            {msgSuccess ? (
              <div className="alert alert-success">{msgSuccess}</div>
            ) : (
              <form onSubmit={handleSendMsg}>
                <div className="form-group">
                  <label>Message</label>
                  <textarea value={msgContent} onChange={e => setMsgContent(e.target.value)} rows={4} required placeholder="Type your message here..." />
                </div>
                <div className="modal-actions">
                  <button type="submit" className="btn-submit" disabled={msgSending}>
                    {msgSending ? 'Sending...' : '✉️ Send Message'}
                  </button>
                  <button type="button" className="btn-cancel" onClick={() => setMsgModal(null)}>Cancel</button>
                </div>
              </form>
            )}
            {msgSuccess && (
              <button className="btn-cancel" style={{marginTop:'0.75rem'}} onClick={() => setMsgModal(null)}>Close</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadDashboard;
