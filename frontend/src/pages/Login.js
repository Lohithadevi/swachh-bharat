import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Auth.css';

const DEMO_ACCOUNTS = [
  { label: '👤 Citizen 1', email: 'citizen1@demo.com', password: 'demo1234', color: '#2e7d32' },
  { label: '👤 Citizen 2', email: 'citizen2@demo.com', password: 'demo1234', color: '#1565c0' },
  { label: '🗑️ Garbage Authority', email: 'garbage@demo.com', password: 'demo1234', color: '#e64a19' },
  { label: '💡 Streetlight Authority', email: 'streetlight@demo.com', password: 'demo1234', color: '#f57c00' },
  { label: '🏛️ Main Head', email: 'head@demo.com', password: 'demo1234', color: '#1a3c6e' },
];

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      if (data.user.role === 'citizen') navigate('/citizen');
      else if (data.user.role === 'authority') navigate('/authority');
      else navigate('/head');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = (acc) => {
    setForm({ email: acc.email, password: acc.password });
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <span className="auth-logo">🇮🇳</span>
          <h2>Sign In</h2>
          <p>SwachhBharath Civic Portal</p>
        </div>

        {/* DEMO ACCESS BOX */}
        <div className="demo-box">
          <div className="demo-box-title">🚀 Demo Access — Click to auto-fill</div>
          <div className="demo-accounts">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.email}
                className="demo-btn"
                style={{ borderColor: acc.color, color: acc.color }}
                onClick={() => handleDemo(acc)}
                type="button"
              >
                {acc.label}
              </button>
            ))}
          </div>
          <div className="demo-note">Password for all demo accounts: <strong>demo1234</strong></div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="Enter your password"
              required
            />
          </div>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
