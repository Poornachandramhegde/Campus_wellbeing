import React from 'react';
import { useNavigate } from 'react-router-dom';
import CounsellorCard from '../components/CounsellorCard';
import '../styles.css';

const Dashboard = () => {
  const navigate = useNavigate();

  // Mock student data
  const student = {
    name: 'Poornachandra',
    studentId: '1RN24CS024',
    email: 'pmh24CS024@ac.in',
    department: 'Computer Science',
    year: '2rd Year',
    semester: '3th Semester'
  };

  // Mock mentor data
  const mentor = {
    name: 'Dr. Archana J R',
    email: 'archanajr@ac.in',
    department: 'MBA'
  };

  // Mock counsellor data
  const counsellor = {
    name: 'Ms. Smitha S',
    email: 'smithas@ac.in',
    officeHours: 'Monday-Friday, 9:00 AM - 5:00 PM'
  };

  const handleBookCounselling = () => {
    navigate('/counselling-booking');
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Student Dashboard</h1>
        <p className="welcome-message">Welcome back, {student.name}</p>
      </div>

      <div className="dashboard-content">
        {/* Student Profile Section */}
        <div className="card profile-card">
          <h2>Student Profile</h2>
          <div className="profile-info">
            <p><strong>Student ID:</strong> {student.studentId}</p>
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
    </div>
  );
};

export default Dashboard;

