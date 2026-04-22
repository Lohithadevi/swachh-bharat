import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Dashboard.css';

const STATES_DATA = {
  'Tamil Nadu': {
    'Madurai': ['Madurai North', 'Madurai South', 'Melur'],
    'Chennai': ['Ambattur', 'Anna Nagar', 'Adyar'],
    'Coimbatore': ['Coimbatore North', 'Coimbatore South', 'Pollachi']
  },
  'Karnataka': {
    'Bengaluru': ['Bengaluru North', 'Bengaluru South', 'Yelahanka'],
    'Mysuru': ['Mysuru North', 'Mysuru South', 'Nanjangud']
  },
  'Maharashtra': {
    'Mumbai': ['Andheri', 'Bandra', 'Kurla'],
    'Pune': ['Hadapsar', 'Kothrud', 'Shivajinagar']
  }
};

const STATUS_STEPS = ['submitted', 'assigned', 'working', 'acceptance_pending', 'completed'];
const STATUS_LABELS = {
  submitted: 'Submitted',
  assigned: 'Assigned to Dept',
  working: 'Work In Progress',
  acceptance_pending: 'Awaiting Your Acceptance',
  completed: 'Completed',
  flagged: 'Flagged'
};

const CitizenDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('public');
  const [publicComplaints, setPublicComplaints] = useState([]);
  const [myComplaints, setMyComplaints] = useState([]);
  const [messages, setMessages] = useState([]);
  const [form, setForm] = useState({ state: '', district: '', taluk: '', area: '', issueType: '', note: '' });
  const [photo, setPhoto] = useState(null);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectForm, setRejectForm] = useState({ note: '', photo: null });

  const districts = form.state ? Object.keys(STATES_DATA[form.state] || {}) : [];
  const taluks = form.state && form.district ? (STATES_DATA[form.state]?.[form.district] || []) : [];

  useEffect(() => {
    API.get('/complaints/public').then(r => setPublicComplaints(r.data));
    API.get('/complaints/my').then(r => setMyComplaints(r.data));
    API.get('/messages/inbox').then(r => setMessages(r.data));
  }, []);

  const handleLike = async (complaintId) => {
    try {
      const { data } = await API.post(`/complaints/${complaintId}/like`);
      setPublicComplaints(prev => prev.map(c =>
        c.complaintId === complaintId ? { ...c, likes: data.likes, likedByMe: true } : c
      ));
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setMsg('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photo) fd.append('photo', photo);
      const { data } = await API.post('/complaints', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg(`Complaint submitted! ID: ${data.complaintId}`);
      setForm({ state: '', district: '', taluk: '', area: '', issueType: '', note: '' });
      setPhoto(null);
      const updated = await API.get('/complaints/my');
      setMyComplaints(updated.data);
    } catch (e) {
      setError(e.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (complaintId) => {
    try {
      await API.post(`/complaints/${complaintId}/respond`, { action: 'accept' });
      const updated = await API.get('/complaints/my');
      setMyComplaints(updated.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('action', 'reject');
      fd.append('rejectionNote', rejectForm.note);
      if (rejectForm.photo) fd.append('rejectionPhoto', rejectForm.photo);
      await API.post(`/complaints/${rejectModal}/respond`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setRejectModal(null);
      const updated = await API.get('/complaints/my');
      setMyComplaints(updated.data);
    } catch (e) {
      alert(e.response?.data?.message || 'Error');
    }
  };

  const getStepIndex = (status) => {
    if (status === 'flagged') return -1;
    return STATUS_STEPS.indexOf(status);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header header-citizen">
        <div className="container">
          <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
            <span style={{fontSize:'3rem'}}>🌱</span>
            <div>
              <h1>Welcome, {user.name}</h1>
              <p>SwachhBharath Civic Portal — Citizen Dashboard</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="tabs">
          {['public', 'report', 'tracking', 'messages', 'profile'].map(t => (
            <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t === 'public' && '🌐 Public Issues'}
              {t === 'report' && '📝 Report Issue'}
              {t === 'tracking' && '📊 My Reports'}
              {t === 'messages' && <>✉️ Messages {messages.filter(m => !m.read).length > 0 && <span className="flag-count">{messages.filter(m => !m.read).length}</span>}</>}
              {t === 'profile' && '👤 Profile'}
            </button>
          ))}
        </div>

        {/* PUBLIC ISSUES */}
        {tab === 'public' && (
          <div className="tab-content">
            <h2>Issues in Your Community</h2>
            {publicComplaints.length === 0 ? <p className="empty">No public issues yet.</p> : (
              <div className="issues-grid">
                {publicComplaints.map(c => (
                  <div key={c._id} className="issue-card-public">
                    <div className="issue-card-header">
                      <span className={`badge badge-${c.issueType}`}>
                        {c.issueType === 'garbage' ? '🗑️ Garbage' : '💡 Street Light'}
                      </span>
                      {c.resolvedByHead
                        ? <span className="status-badge status-resolved-head">✅ Resolved by Head</span>
                        : <span className={`status-badge status-${c.status}`}>{STATUS_LABELS[c.status] || c.status}</span>
                      }
                    </div>
                    {c.photo && (
                      <img src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/uploads/${c.photo}`} alt="Issue" className="issue-photo" />
                    )}
                    <div className="issue-card-body">
                      <div className="issue-location">📍 {c.area}, {c.taluk}, {c.district}, {c.state}</div>
                      {c.note && <p className="issue-note">{c.note}</p>}
                      <div className="issue-meta">
                        <button
                          className={`like-btn ${c.likedByMe ? 'liked' : ''}`}
                          onClick={() => !c.likedByMe && handleLike(c.complaintId)}
                          disabled={c.likedByMe}
                        >
                          👍 {c.likes} Support{c.likedByMe ? 'd' : ''}
                        </button>
                        <span className="issue-id">#{c.complaintId}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* REPORT ISSUE */}
        {tab === 'report' && (
          <div className="tab-content">
            <h2>Report a Civic Issue</h2>
            {msg && <div className="alert alert-success">{msg}</div>}
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmit} className="report-form">
              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value, district: '', taluk: '' })} required>
                    <option value="">Select State</option>
                    {Object.keys(STATES_DATA).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>District</label>
                  <select value={form.district} onChange={e => setForm({ ...form, district: e.target.value, taluk: '' })} required disabled={!form.state}>
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Taluk</label>
                  <select value={form.taluk} onChange={e => setForm({ ...form, taluk: e.target.value })} required disabled={!form.district}>
                    <option value="">Select Taluk</option>
                    {taluks.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Area / Landmark</label>
                <input type="text" value={form.area} onChange={e => setForm({ ...form, area: e.target.value })} placeholder="e.g. Near bus stand, Main road" required />
              </div>
              <div className="form-group">
                <label>Issue Type</label>
                <select value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value })} required>
                  <option value="">Select Issue Type</option>
                  <option value="garbage">🗑️ Garbage & Sanitation</option>
                  <option value="streetlight">💡 Street Lighting</option>
                </select>
              </div>
              <div className="form-group">
                <label>Description / Note</label>
                <textarea value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} rows={3} placeholder="Describe the issue briefly..." />
              </div>
              <div className="form-group">
                <label>Upload Photo (optional)</label>
                <input type="file" accept="image/*" onChange={e => setPhoto(e.target.files[0])} />
              </div>
              <button type="submit" className="btn-submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          </div>
        )}

        {/* TRACKING */}
        {tab === 'tracking' && (
          <div className="tab-content">
            <h2>My Reported Issues</h2>
            {myComplaints.length === 0 ? <p className="empty">You haven't reported any issues yet.</p> : (
              myComplaints.map(c => (
                <div key={c._id} className="tracking-card">
                  <div className="tracking-header">
                    <div>
                      <span className={`badge badge-${c.issueType}`}>
                        {c.issueType === 'garbage' ? '🗑️ Garbage' : '💡 Street Light'}
                      </span>
                      <span className="tracking-id">#{c.complaintId}</span>
                    </div>
                    <span className={`status-badge status-${c.status}`}>{STATUS_LABELS[c.status] || c.status}</span>
                  </div>
                  <div className="tracking-location">📍 {c.area}, {c.taluk}, {c.district}, {c.state}</div>

                  {c.status !== 'flagged' && (
                    <div className="progress-tracker">
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} className={`progress-step ${i <= getStepIndex(c.status) ? 'done' : ''} ${c.status === step ? 'current' : ''}`}>
                          <div className="step-dot"></div>
                          <div className="step-label">{STATUS_LABELS[step]}</div>
                          {i < STATUS_STEPS.length - 1 && <div className="step-line"></div>}
                        </div>
                      ))}
                    </div>
                  )}

                  {c.status === 'flagged' && (
                    <div className={`flag-notice ${c.resolvedByHead ? 'flag-notice-resolved' : ''}`}>
                      {c.resolvedByHead
                        ? `✅ This issue has been reviewed and resolved by the Main Head on ${new Date(c.resolvedByHeadAt).toLocaleDateString('en-IN')}.`
                        : c.rejectionNote
                          ? '⚠️ Your rejection has been flagged to the Main Head. Awaiting action.'
                          : '⚠️ Acceptance ignored — flagged to Main Head. Awaiting action.'
                      }
                    </div>
                  )}

                  {c.status === 'acceptance_pending' && (
                    <div className="acceptance-actions">
                      <p>The authority has completed the work. Please verify and respond.</p>
                      <div className="action-btns">
                        <button className="btn-accept" onClick={() => handleAccept(c.complaintId)}>✅ Accept — Issue Resolved</button>
                        <button className="btn-reject" onClick={() => setRejectModal(c.complaintId)}>❌ Reject — Not Resolved</button>
                      </div>
                    </div>
                  )}

                  <div className="tracking-meta">
                    <span>👍 {c.likes} supports</span>
                    <span>Reported: {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                    {c.dueDate && <span>Due: {new Date(c.dueDate).toLocaleDateString('en-IN')}</span>}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MESSAGES */}
        {tab === 'messages' && (
          <div className="tab-content">
            <h2>Messages from Main Head</h2>
            <InboxSection messages={messages} setMessages={setMessages} />
          </div>
        )}

        {/* PROFILE */}
        {tab === 'profile' && (
          <div className="tab-content">
            <h2>My Profile</h2>
            <ProfileUpdate user={user} />
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Reject Acceptance</h3>
            <p>Please provide a reason and optionally a photo proof.</p>
            <form onSubmit={handleReject}>
              <div className="form-group">
                <label>Reason for Rejection</label>
                <textarea value={rejectForm.note} onChange={e => setRejectForm({ ...rejectForm, note: e.target.value })} rows={3} required placeholder="Describe why the issue is not resolved..." />
              </div>
              <div className="form-group">
                <label>Photo Proof (optional)</label>
                <input type="file" accept="image/*" onChange={e => setRejectForm({ ...rejectForm, photo: e.target.files[0] })} />
              </div>
              <div className="modal-actions">
                <button type="submit" className="btn-reject">Submit Rejection</button>
                <button type="button" className="btn-cancel" onClick={() => setRejectModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const InboxSection = ({ messages, setMessages }) => {
  const markRead = async (id) => {
    await API.post(`/messages/${id}/read`);
    setMessages(prev => prev.map(m => m._id === id ? { ...m, read: true } : m));
  };

  if (messages.length === 0) return <p className="empty">No messages yet.</p>;

  return (
    <div className="inbox-list">
      {messages.map(m => (
        <div key={m._id} className={`inbox-item ${!m.read ? 'unread' : ''}`}>
          <div className="inbox-item-header">
            <div className="inbox-from">From: <strong>{m.senderId?.name || 'Main Head'}</strong></div>
            <div className="inbox-meta">
              {!m.read && <span className="unread-dot">New</span>}
              <span>{new Date(m.createdAt).toLocaleDateString('en-IN')}</span>
            </div>
          </div>
          {m.complaintId && <div className="inbox-ref">Re: Complaint #{m.complaintId}</div>}
          <div className="inbox-content">{m.content}</div>
          {!m.read && (
            <button className="btn-mark-read" onClick={() => markRead(m._id)}>Mark as Read</button>
          )}
        </div>
      ))}
    </div>
  );
};

const ProfileUpdate = ({ user }) => {

  return (
    <div className="profile-card">
      <div className="profile-info">
        <div className="profile-avatar">{user.name?.charAt(0).toUpperCase()}</div>
        <div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <span className="role-badge">Citizen</span>
        </div>
      </div>
      <div className="profile-details">
        <div className="detail-row"><span>Email</span><strong>{user.email}</strong></div>
        <div className="detail-row"><span>Phone</span><strong>{user.phone || 'Not provided'}</strong></div>
        <div className="detail-row"><span>Role</span><strong>Citizen</strong></div>
      </div>
    </div>
  );
};

export default CitizenDashboard;
