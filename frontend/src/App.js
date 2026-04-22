import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicIssues from './pages/PublicIssues';
import About from './pages/About';
import CitizenDashboard from './pages/CitizenDashboard';
import AuthorityDashboard from './pages/AuthorityDashboard';
import HeadDashboard from './pages/HeadDashboard';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/issues" element={
            <ProtectedRoute roles={['citizen']}>
              <PublicIssues />
            </ProtectedRoute>
          } />
          <Route path="/about" element={<About />} />
          <Route path="/citizen" element={
            <ProtectedRoute roles={['citizen']}>
              <CitizenDashboard />
            </ProtectedRoute>
          } />
          <Route path="/authority" element={
            <ProtectedRoute roles={['authority']}>
              <AuthorityDashboard />
            </ProtectedRoute>
          } />
          <Route path="/head" element={
            <ProtectedRoute roles={['head']}>
              <HeadDashboard />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
