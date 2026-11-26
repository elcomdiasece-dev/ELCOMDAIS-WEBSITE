import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CalendarPage from './pages/CalendarPage';
import EventDetailsPage from './pages/EventDetailsPage';
import GalleryPage from './pages/GalleryPage';
import About from './pages/About';
import JoinPage from './pages/JoinPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route: a localStorage flag is forgeable, so verify a real Supabase session
const ProtectedRoute = ({ children }) => {
  const [ok, setOk] = useState(null);
  useEffect(() => {
    (supabase ? supabase.auth.getSession() : Promise.resolve({ data: {} }))
      .then(({ data }) => {
        if (!data?.session) {
          localStorage.removeItem('elcomdais_admin_token');
          localStorage.removeItem('elcomdais_admin_user');
        }
        setOk(!!data?.session);
      })
      .catch(() => setOk(false));
  }, []);
  if (ok === null) return null;
  return ok ? children : <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        
        {/* Main Content Area */}
        <main style={{ flexGrow: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/events/:slug" element={<EventDetailsPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/join" element={<JoinPage />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            {/* Catch all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
