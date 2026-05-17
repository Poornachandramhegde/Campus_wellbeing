import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CounsellingBooking from './pages/CounsellingBooking';
import CounsellorDashboard from './pages/counsellor/CounsellorDashboard';
import './styles.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/counselling-booking" element={<CounsellingBooking />} />
          <Route path="/counsellor-dashboard" element={<CounsellorDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

