
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet
} from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import CounsellingBooking from './pages/CounsellingBooking';
import AppointmentHistory from './pages/AppointmentHistory';
import CounsellorDashboard from './pages/counsellor/CounsellorDashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import { AuthProvider } from './context/AuthContext';
import { TicketProvider } from './context/TicketContext';

import './styles.css';

const ProtectedLayout = () => {
  return (
    <>
      <Navbar />

      <main className="protected-page-content">
        <Outlet />
      </main>
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <TicketProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/login"
                element={<Login />}
              />

              <Route
                path="/signup"
                element={<Signup />}
              />

              {/* Protected Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <ProtectedLayout />
                  </ProtectedRoute>
                }
              >
                <Route
                  path="/"
                  element={<Dashboard />}
                />

                <Route
                  path="/counselling-booking"
                  element={<CounsellingBooking />}
                />

                <Route
                  path="/appointment-history"
                  element={<AppointmentHistory />}
                />

                <Route
                  path="/counsellor-dashboard"
                  element={<CounsellorDashboard />}
                />
              </Route>

              {/* Catch-all Route */}
              <Route
                path="*"
                element={<Navigate to="/" replace />}
              />
            </Routes>
          </div>
        </Router>
      </TicketProvider>
    </AuthProvider>
  );
}

export default App;