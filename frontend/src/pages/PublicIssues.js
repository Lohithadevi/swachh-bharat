import React, { useEffect, useState } from 'react';
import API from '../api';
import './PublicIssues.css';

const PublicIssues = () => {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState({ issueType: '', state: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/complaints/public')
      .then(r => setComplaints(r.data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = complaints.filter(c => {
    if (filter.issueType && c.issueType !== filter.issueType) return false;
    if (filter.state && c.state !== filter.state) return false;
    return true;
  });

  const states = [...new Set(complaints.map(c => c.state))];

  return (
    <div className="public-issues">
      <div className="page-header">
        <div className="container">
          <h1>Public Issues</h1>
          <p>Civic issues reported by citizens across your area</p>
        </div>
      </div>

      <div className="container">
        <div className="filters">
          <select value={filter.issueType} onChange={e => setFilter({ ...filter, issueType: e.target.value })}>
            <option value="">All Issue Types</option>
            <option value="garbage">Garbage</option>
            <option value="streetlight">Street Light</option>
          </select>
          <select value={filter.state} onChange={e => setFilter({ ...filter, state: e.target.value })}>
            <option value="">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="loading">Loading issues...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">No issues found</div>
        ) : (
          <div className="issues-grid">
            {filtered.map(c => (
              <div key={c._id} className="issue-card-public">
                <div className="issue-card-header">
                  <span className={`badge badge-${c.issueType}`}>
                    {c.issueType === 'garbage' ? '🗑️ Garbage' : '💡 Street Light'}
                  </span>
                  <span className={`status-badge status-${c.status}`}>{c.status.replace('_', ' ')}</span>
                </div>
                {c.photo && (
                  <img
                    src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}/uploads/${c.photo}`}
                    alt="Issue"
                    className="issue-photo"
                  />
                )}
                <div className="issue-card-body">
                  <div className="issue-location">
                    📍 {c.area}, {c.taluk}, {c.district}, {c.state}
                  </div>
                  {c.note && <p className="issue-note">{c.note}</p>}
                  <div className="issue-meta">
                    <span>👍 {c.likes} supports</span>
                    <span className="issue-id">#{c.complaintId}</span>
                    <span>{new Date(c.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicIssues;
