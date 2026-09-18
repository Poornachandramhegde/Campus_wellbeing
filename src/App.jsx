import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CounsellingBooking from './pages/CounsellingBooking';
import CounsellorDashboard from './pages/counsellor/CounsellorDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';
import './styles.css';

function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              {/* Protected ERP Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/counselling-booking"
                element={
                  <ProtectedRoute>
                    <CounsellingBooking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/counsellor-dashboard"
                element={
                  <ProtectedRoute>
                    <CounsellorDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all redirect */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;
