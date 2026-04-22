import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const STATS = [
  { num: '2', label: 'Issue Categories' },
  { num: '3', label: 'States Covered' },
  { num: '24/7', label: 'Portal Access' },
  { num: '100%', label: 'Transparent' }
];

/* Ashoka Chakra SVG */
const AshokaChakra = ({ size = 60, color = '#00008B' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="48" stroke={color} strokeWidth="3" fill="none"/>
    <circle cx="50" cy="50" r="6" fill={color}/>
    {Array.from({ length: 24 }).map((_, i) => {
      const angle = (i * 360) / 24;
      const rad = (angle * Math.PI) / 180;
      const x1 = 50 + 6 * Math.cos(rad);
      const y1 = 50 + 6 * Math.sin(rad);
      const x2 = 50 + 44 * Math.cos(rad);
      const y2 = 50 + 44 * Math.sin(rad);
      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth="1.5"/>;
    })}
  </svg>
);

const Home = () => (
  <div className="home">

    {/* TRICOLOR TOP STRIP */}
    <div className="tricolor-strip">
      <div className="tc-saffron"/>
      <div className="tc-white">
        <AshokaChakra size={14} color="#00008B"/>
      </div>
      <div className="tc-green"/>
    </div>

    {/* GOV HEADER */}
    <div className="gov-header">
      <div className="gov-header-inner">
        <div className="gov-logo-block">
          <div className="gov-emblem">
            <AshokaChakra size={64} color="#1a3c6e"/>
          </div>
          <div className="gov-title-block">
            <div className="gov-title-hi">स्वच्छ भारत नागरिक पोर्टल</div>
            <div className="gov-title-en">SwachhBharath Civic Portal</div>
            <div className="gov-subtitle">Citizen Grievance &amp; Issue Reporting System — Government of India</div>
          </div>
        </div>
        <div className="gov-header-actions">
          <Link to="/login" className="hdr-btn-login">Login</Link>
          <Link to="/register" className="hdr-btn-register">Register</Link>
        </div>
      </div>
    </div>

    {/* NOTICE MARQUEE */}
    <div className="notice-bar">
      <span className="notice-label">📢 Notice</span>
      <div className="notice-marquee">
        <span>
          Citizens are requested to register with a valid email ID &nbsp;|&nbsp;
          Report civic issues with photo proof for faster resolution &nbsp;|&nbsp;
          All complaints are tracked and resolved within the stipulated time &nbsp;|&nbsp;
          For urgent issues contact your local municipal office &nbsp;|&nbsp;
        </span>
      </div>
    </div>

    {/* HERO — India Gate */}
    <section className="hero-gate">
      <div className="hero-gate-bg">
        <img
          src="/india-gate(2).jpg"
          alt="India Gate"
          className="hero-gate-img"
          onError={e => { e.target.src = '/india-gate(3).jpg'; }}
        />
      </div>
      <div className="hero-gate-overlay"/>
      <div className="hero-gate-content">
        <div className="hero-gate-badge">Government of India Initiative</div>
        <h1>स्वच्छ भारत — Swachh Bharat</h1>
        <p>Report civic issues in your area. Track resolution in real time.<br/>Together, let us build a cleaner and safer India.</p>
        <div className="hero-gate-actions">
          <Link to="/register" className="btn-hero-primary">Register as Citizen</Link>
          <Link to="/login" className="btn-hero-secondary">Login to Portal</Link>
        </div>
      </div>
    </section>

    {/* STATS BAR */}
    <div className="stats-bar">
      {STATS.map((s, i) => (
        <div key={i} className="stats-bar-item">
          <div className="stats-bar-num">{s.num}</div>
          <div className="stats-bar-label">{s.label}</div>
        </div>
      ))}
    </div>

    {/* HOW IT WORKS */}
    <section className="section-how">
      <div className="container">
        <div className="gov-section-title">
          <div className="gov-section-title-bar"/>
          <div className="gov-section-title-text">
            <span className="gov-section-label">Citizen Services</span>
            <h2>How to Use This Portal</h2>
          </div>
        </div>
        <div className="gov-steps-table">
          {[
            { n:'01', icon:'📝', title:'Register & Verify', desc:'Create your account using a valid email address. An OTP will be sent for verification. Complete registration to access all citizen services.' },
            { n:'02', icon:'📍', title:'Submit a Complaint', desc:'Select your State, District, Taluk and locality. Choose the issue type — Garbage or Street Light. Add a description and photo proof.' },
            { n:'03', icon:'🏛️', title:'Automatic Department Assignment', desc:'The portal automatically identifies the concerned department based on issue type and location and assigns the complaint accordingly.' },
            { n:'04', icon:'📋', title:'Track Your Complaint', desc:'Monitor the status of your complaint in real time — from Submitted → Assigned → Working → Acceptance Pending → Completed.' },
            { n:'05', icon:'✅', title:'Verify & Accept Resolution', desc:'Once the authority marks work as complete, you will be notified. Verify the resolution on ground and accept or reject with proof.' },
            { n:'06', icon:'🚩', title:'Escalation to Main Head', desc:'If acceptance is ignored or rejected, the complaint is automatically escalated to the Main Head for necessary action.' },
          ].map((s, i) => (
            <div key={s.n} className={`gov-step-row ${i % 2 === 0 ? '' : 'alt'}`}>
              <div className="gov-step-num-col">
                <div className="gov-step-circle">{s.n}</div>
              </div>
              <div className="gov-step-icon-col">{s.icon}</div>
              <div className="gov-step-content">
                <div className="gov-step-title">{s.title}</div>
                <div className="gov-step-desc">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* SERVICES */}
    <section className="section-services">
      <div className="container">
        <div className="gov-section-title">
          <div className="gov-section-title-bar"/>
          <div className="gov-section-title-text">
            <span className="gov-section-label">Departments</span>
            <h2>Services Offered Under This Portal</h2>
          </div>
        </div>
        <div className="gov-services-wrap">
          <div className="gov-service-block">
            <div className="gov-service-head garbage-head">
              <span className="gov-service-head-icon">🗑️</span>
              <div>
                <div className="gov-service-head-title">Garbage &amp; Sanitation Department</div>
                <div className="gov-service-head-sub">Municipal Solid Waste Management</div>
              </div>
              <div className="gov-service-sla">SLA: 4 Working Days</div>
            </div>
            <table className="gov-service-table">
              <thead>
                <tr>
                  <th>Issue Type</th>
                  <th>Description</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Overflowing Dustbins</td><td>Garbage bins not cleared for extended period</td><td><span className="priority high">High</span></td></tr>
                <tr><td>Illegal Dumping</td><td>Waste dumped in unauthorised public areas</td><td><span className="priority high">High</span></td></tr>
                <tr><td>Blocked Drainage</td><td>Clogged drains causing waterlogging</td><td><span className="priority medium">Medium</span></td></tr>
                <tr><td>Unsanitary Areas</td><td>Unhygienic conditions in public spaces</td><td><span className="priority medium">Medium</span></td></tr>
              </tbody>
            </table>
          </div>

          <div className="gov-service-block">
            <div className="gov-service-head streetlight-head">
              <span className="gov-service-head-icon">💡</span>
              <div>
                <div className="gov-service-head-title">Street Lighting Department</div>
                <div className="gov-service-head-sub">Public Infrastructure &amp; Electrical Maintenance</div>
              </div>
              <div className="gov-service-sla">SLA: 3 Working Days</div>
            </div>
            <table className="gov-service-table">
              <thead>
                <tr>
                  <th>Issue Type</th>
                  <th>Description</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Non-functional Streetlight</td><td>Street lamp not working or flickering</td><td><span className="priority high">High</span></td></tr>
                <tr><td>Dark Road / Lane</td><td>Entire stretch without lighting at night</td><td><span className="priority high">High</span></td></tr>
                <tr><td>Damaged Light Pole</td><td>Pole bent, broken or posing safety risk</td><td><span className="priority medium">Medium</span></td></tr>
                <tr><td>Missing Street Lamp</td><td>Lamp removed or stolen from pole</td><td><span className="priority low">Low</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="section-cta">
      <div className="container">
        <div className="cta-box">
          <div className="cta-text">
            <h2>Be a Responsible Citizen</h2>
            <p>Join citizens who are actively making their cities cleaner and safer through SwachhBharath Portal.</p>
          </div>
          <div className="cta-actions">
            <Link to="/register" className="btn-hero-primary">Register as Citizen</Link>
            <Link to="/login" className="btn-hero-secondary">Already Registered? Login</Link>
          </div>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer className="footer">
      <div className="footer-top">
        <div className="container footer-grid">
          <div className="footer-col">
            <div className="footer-logo">
              <AshokaChakra size={36} color="#cdd8e8"/>
              <span>SwachhBharath Portal</span>
            </div>
            <p>A Government of India initiative to empower citizens to report and track civic issues in their locality.</p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/login">Login</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Contact Us</h4>
            <p>📧 support@swachhbharath.gov.in</p>
            <p>📞 1800-XXX-XXXX (Toll Free)</p>
            <p>🕐 Mon–Sat, 9AM – 6PM</p>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2024 SwachhBharath Civic Portal | Government of India | Ministry of Housing &amp; Urban Affairs</p>
        </div>
      </div>
    </footer>

  </div>
);

export default Home;
