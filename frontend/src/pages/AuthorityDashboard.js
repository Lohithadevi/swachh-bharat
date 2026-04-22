import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Dashboard.css';

const STATUS_LABELS = {
  submitted: 'Submitted',
  assigned: 'Assigned',
  working: 'Working',
  acceptance_pending: 'Acceptance Pending',
  completed: 'Completed',
  flagged: 'Flagged'
};

const AuthorityDashboard = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState('assigned');
  const [assigned, setAssigned] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [a, c, m] = await Promise.all([
        API.get('/authority/assigned'),
        API.get('/authority/completed'),
        API.get('/messages/inbox')
      ]);
      setAssigned(a.data);
      setCompleted(c.data);
      setMessages(m.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleStart = async (id) => {
    try {
      await API.post(`/authority/${id}/start`);
      fetchData();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const handleComplete = async (id) => {
    if (!window.confirm('Raise acceptance for this task?')) return;
    try {
      await API.post(`/authority/${id}/complete`);
      fetchData();
    } catch (e) { alert(e.response?.data?.message || 'Error'); }
  };

  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  return (
    <div className="dashboard">
      <div className={`dashboard-header ${user.dept === 'garbage' ? 'header-garbage' : 'header-streetlight'}`}>
        <div className="container">
          <div className="authority-header-inner">
            <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
              <span style={{fontSize:'3rem'}}>{user.dept === 'garbage' ? '🗑️' : '💡'}</span>
              <div>
                <h1>Authority Dashboard</h1>
                <p>{user.dept === 'garbage' ? 'Garbage & Sanitation' : 'Street Lighting'} Department — {user.district}, {user.state}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className={`tabs tabs-${user.dept}`}>
          <button className={`tab ${tab === 'assigned' ? 'active' : ''}`} onClick={() => setTab('assigned')}>
            📋 Assigned Tasks ({assigned.length})
          </button>
          <button className={`tab ${tab === 'completed' ? 'active' : ''}`} onClick={() => setTab('completed')}>
            ✅ Completed Tasks ({completed.length})
          </button>
          <button className={`tab ${tab === 'messages' ? 'active' : ''}`} onClick={() => setTab('messages')}>
            ✉️ Messages {messages.filter(m => !m.read).length > 0 && <span className="flag-count">{messages.filter(m => !m.read).length}</span>}
          </button>
        </div>

        {loading ? <div className="loading">Loading...</div> : (
          <div className="tab-content">
            {tab === 'assigned' && (
              <>
                <h2>Assigned Tasks</h2>
                {assigned.length === 0 ? <p className="empty">No assigned tasks.</p> : (
                  assigned.map(c => (
                    <div key={c._id} className={`task-card ${isOverdue(c.dueDate) ? 'overdue' : ''}`}>
                      <div className="task-header">
                        <div>
                          <span className={`badge badge-${c.issueType}`}>
                            {c.issueType === 'garbage' ? '🗑️ Garbage' : '💡 Street Light'}
                          </span>
                          <span className="tracking-id">#{c.complaintId}</span>
                        </div>
                        <div className="task-right">
                          {isOverdue(c.dueDate) && <span className="overdue-badge">⚠️ Overdue</span>}
                          <span className={`status-badge status-${c.status}`}>{STATUS_LABELS[c.status]}</span>
                        </div>
                      </div>
                      <div className="task-location">📍 {c.area}, {c.taluk}, {c.district}, {c.state}</div>
                      {c.note && <p className="task-note">{c.note}</p>}
                      {c.photo && (
                        <img src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/uploads/${c.photo}`} alt="Issue" className="task-photo" />
                      )}
                      <div className="task-meta">
                        <span>👍 {c.likes} supports</span>
                        <span>Due: {c.dueDate ? new Date(c.dueDate).toLocaleDateString('en-IN') : 'N/A'}</span>
                        <span>Reported: {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                      <div className="task-actions">
                        {c.status === 'assigned' && (
                          <button className="btn-start" onClick={() => handleStart(c.complaintId)}>▶ Start Work</button>
                        )}
                        {c.status === 'working' && (
                          <button className="btn-complete" onClick={() => handleComplete(c.complaintId)}>✅ Raise Acceptance</button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}

            {tab === 'completed' && (
              <>
                <h2>Completed Tasks</h2>
                {completed.length === 0 ? <p className="empty">No completed tasks yet.</p> : (
                  completed.map(c => (
                    <div key={c._id} className="task-card">
                      <div className="task-header">
                        <div>
                          <span className={`badge badge-${c.issueType}`}>
                            {c.issueType === 'garbage' ? '🗑️ Garbage' : '💡 Street Light'}
                          </span>
                          <span className="tracking-id">#{c.complaintId}</span>
                        </div>
                        <span className={`status-badge status-${c.status === 'flagged' ? 'completed' : c.status}`}>
                          {c.status === 'flagged' ? 'Submitted' : STATUS_LABELS[c.status]}
                        </span>
                      </div>
                      <div className="task-location">📍 {c.area}, {c.taluk}, {c.district}, {c.state}</div>
                      <div className="task-meta">
                        <span>Reported: {new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                        {c.acceptanceRaisedAt && <span>Acceptance Raised: {new Date(c.acceptanceRaisedAt).toLocaleDateString('en-IN')}</span>}
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
            {tab === 'messages' && (
              <div className="tab-content">
                <h2>Messages from Main Head</h2>
                <AuthorityInbox messages={messages} setMessages={setMessages} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const AuthorityInbox = ({ messages, setMessages }) => {
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
          {!m.read && <button className="btn-mark-read" onClick={() => markRead(m._id)}>Mark as Read</button>}
        </div>
      ))}
    </div>
  );
};

export default AuthorityDashboard;
