import React from 'react';
import TicketQueue from '../../components/counsellor/TicketQueue';
import '../../styles.css';

const CounsellorDashboard = () => {
  // Mock counsellor profile data
  const counsellor = {
    name: 'Ms. Smitha S',
    email: 'smithas@ac.in',
    role: 'Student Counsellor',
    officeHours: 'Monday-Friday, 9:00 AM - 5:00 PM'
  };

  return (
    <div className="counsellor-dashboard">
      <div className="dashboard-header">
        <h1>Counsellor Dashboard</h1>
        <p className="welcome-message">Welcome, {counsellor.name}</p>
      </div>

      <div className="dashboard-content">
        {/* Counsellor Profile Section */}
        <div className="card profile-card">
          <h2>Counsellor Profile</h2>
          <div className="profile-info">
            <p><strong>Name:</strong> {counsellor.name}</p>
            <p><strong>Email:</strong> {counsellor.email}</p>
            <p><strong>Role:</strong> {counsellor.role}</p>
            <p><strong>Office Hours:</strong> {counsellor.officeHours}</p>
          </div>
        </div>

        {/* Counselling Requests Queue */}
        <div className="card queue-card">
          <h2>Counselling Requests Queue</h2>
          <TicketQueue />
        </div>
      </div>
    </div>
  );
};

export default CounsellorDashboard;

