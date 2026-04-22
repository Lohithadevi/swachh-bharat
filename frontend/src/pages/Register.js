import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import './Auth.css';

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

const Register = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=form, 2=otp
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    phone: '', role: 'citizen', dept: '', state: '', district: '', taluk: ''
  });
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const states = Object.keys(STATES_DATA);
  const districts = form.state ? Object.keys(STATES_DATA[form.state] || {}) : [];
  const taluks = form.state && form.district ? (STATES_DATA[form.state]?.[form.district] || []) : [];

  const sendOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      await API.post('/auth/send-otp', { email: form.email });
      setStep(2);
      setSuccess('OTP sent to your email');
    } catch (err) {
      console.error('FULL ERROR:', err);
      console.error('Response:', err.response);
      console.error('Message:', err.message);
      const msg = err.response?.data?.message || err.message || 'Failed to send OTP';
      setError('Error: ' + msg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await API.post('/auth/verify-otp', { email: form.email, otp });
      await API.post('/auth/register', {
        name: form.name, email: form.email, password: form.password,
        phone: form.phone, role: form.role,
        dept: form.role === 'authority' ? form.dept : null,
        state: form.state, district: form.district, taluk: form.taluk
      });
      setSuccess('Registration successful!');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <span className="auth-logo">🇮🇳</span>
          <h2>Create Account</h2>
          <p>SwachhBharath Civic Portal</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {step === 1 && (
          <form onSubmit={sendOTP}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" />
              </div>
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="Valid email address" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" required />
              </div>
              <div className="form-group">
                <label>Confirm Password</label>
                <input type="password" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} placeholder="Repeat password" required />
              </div>
            </div>

            <div className="form-group">
              <label>Register As</label>
              <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value, dept: '' })}>
                <option value="citizen">Citizen</option>
                <option value="authority">Local Authority</option>
                <option value="head">Main Head</option>
              </select>
            </div>

            {form.role === 'authority' && (
              <div className="form-group">
                <label>Department</label>
                <select value={form.dept} onChange={e => setForm({ ...form, dept: e.target.value })} required>
                  <option value="">Select Department</option>
                  <option value="garbage">Garbage & Sanitation</option>
                  <option value="streetlight">Street Lighting</option>
                </select>
              </div>
            )}

            {(form.role === 'authority' || form.role === 'head') && (
              <div className="form-row">
                <div className="form-group">
                  <label>State</label>
                  <select value={form.state} onChange={e => setForm({ ...form, state: e.target.value, district: '', taluk: '' })} required>
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
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
            )}

            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP & Continue'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleRegister}>
            <div className="otp-info">
              <p>OTP sent to <strong>{form.email}</strong></p>
              <p className="otp-dev-note">⚠️ If email doesn't arrive, check the backend console for the OTP.</p>
            </div>
            <div className="form-group">
              <label>Enter OTP</label>
              <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit OTP" maxLength={6} required />
            </div>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Register'}
            </button>
            <button type="button" className="btn-back" onClick={() => setStep(1)}>← Back</button>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
