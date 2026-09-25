import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import CounsellorCard from '../components/CounsellorCard';
import ChatbotWidget from '../components/ChatbotWidget';
import { TicketContext } from '../context/TicketContext';
import '../styles.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const { student } = useContext(TicketContext);

  // Read mentor data from student context
  const mentor = student.mentor || {
    name: 'Dr. Archana J R',
    email: 'archanajr@rnsitmba.ac.in',
    department: 'MBA'
  };

  // Counsellor data
  const counsellor = {
    name: 'Dr. Leena C',
    email: 'leenac@rnsit.ac.in',
    officeHours: 'Monday-Friday, 9:00 AM - 5:00 PM'
  };

  const handleBookCounselling = () => {
    navigate('/counselling-booking');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <p className="welcome-message">Welcome back, {student.name}</p>
      </div>

      <div className="dashboard-content">
        {/* Student Profile Section */}
        <div className="card profile-card">
          <h2>Student Profile</h2>
          <div className="profile-info">
            <p><strong>Student ID / USN:</strong> {student.studentId}</p>
            <p><strong>Name:</strong> {student.name}</p>
            <p><strong>Email:</strong> {student.email}</p>
            <p><strong>Department:</strong> {student.department}</p>
            <p><strong>Year:</strong> {student.year}</p>
            <p><strong>Semester:</strong> {student.semester}</p>
          </div>
        </div>

        {/* Mentor Section */}
        <div className="card mentor-card">
          <h2>Academic Mentor</h2>
          <div className="mentor-info">
            <p><strong>Name:</strong> {mentor.name}</p>
            <p><strong>Email:</strong> {mentor.email}</p>
            <p><strong>Department:</strong> {mentor.department}</p>
          </div>
        </div>

        {/* Counsellor Section */}
        <CounsellorCard counsellor={counsellor} />

        {/* Book Counselling Button */}
        <div className="action-section">
          <button 
            className="btn btn-primary btn-large"
            onClick={handleBookCounselling}
          >
            Book Counselling Slot
          </button>
        </div>
      </div>

      {/* Floating Chatbot Assistant */}
      <ChatbotWidget />
    </div>
  );
};

export default Dashboard;
