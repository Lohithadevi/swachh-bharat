import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'citizen') return '/citizen';
    if (user.role === 'authority') return '/authority';
    if (user.role === 'head') return '/head';
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">
          <svg width="22" height="22" viewBox="0 0 100 100" fill="none" style={{flexShrink:0}}>
            <circle cx="50" cy="50" r="46" stroke="#fff" strokeWidth="3" fill="none"/>
            <circle cx="50" cy="50" r="6" fill="#fff"/>
            {Array.from({length:24}).map((_,i)=>{
              const a=(i*360/24)*Math.PI/180;
              return <line key={i} x1={50+6*Math.cos(a)} y1={50+6*Math.sin(a)} x2={50+40*Math.cos(a)} y2={50+40*Math.sin(a)} stroke="#fff" strokeWidth="1.5"/>;
            })}
          </svg>
          <span className="brand-name">SwachhBharath</span>
        </Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        {user && user.role === 'citizen' && <Link to="/citizen">Public Issues</Link>}
        <Link to="/about">About</Link>
        {user ? (
          <>
            <Link to={getDashboardLink()}>Dashboard</Link>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn-nav">Login</Link>
            <Link to="/register" className="btn-nav btn-primary">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
