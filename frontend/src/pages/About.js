import React from 'react';
import './About.css';

const About = () => (
  <div className="about-page">
    <div className="page-header">
      <div className="container">
        <h1>About SwachhBharath Portal</h1>
        <p>A Government of India civic issue reporting initiative</p>
      </div>
    </div>
    <div className="container about-content">
      <div className="about-section">
        <h2>Our Mission</h2>
        <p>SwachhBharath Portal empowers citizens to report civic issues in their locality and track resolution in real time. We bridge the gap between citizens and local authorities through a transparent, accountable digital platform.</p>
      </div>
      <div className="about-section">
        <h2>How to Use</h2>
        <ol>
          <li>Register with your email and verify with OTP</li>
          <li>Login and navigate to Report Issue</li>
          <li>Select your area, issue type, add a photo and note</li>
          <li>Track your complaint status in My Reports</li>
          <li>Accept or reject the resolution when authorities complete the work</li>
        </ol>
      </div>
      <div className="about-section">
        <h2>Contact</h2>
        <p>Email: <a href="mailto:support@swachhbharath.gov.in">support@swachhbharath.gov.in</a></p>
        <p>Helpline: 1800-XXX-XXXX (Toll Free)</p>
        <p>Working Hours: Monday to Saturday, 9:00 AM – 6:00 PM</p>
      </div>
    </div>
  </div>
);

export default About;
