import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CalendarPage from './pages/CalendarPage';
import EventDetailsPage from './pages/EventDetailsPage';
import GalleryPage from './pages/GalleryPage';
import About from './pages/About';
import AdminLogin from './pages/AdminLogin';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Wrapper for Admin Panel
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('elcomdais_admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
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
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/register-admin" element={<AdminRegister />} />
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
