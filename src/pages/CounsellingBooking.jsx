import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import ConfirmationCard from '../components/ConfirmationCard';
import { TicketContext } from '../context/TicketContext';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

const API_URL = import.meta.env.VITE_API_URL || '';

const CounsellingBooking = () => {
  const navigate = useNavigate();
  const { student, addTicket } = useContext(TicketContext);
  const { token } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const formatTimeToAMPM = (time24) => {
    if (!time24) return '';
    const [hStr, mStr] = time24.split(':');
    let hours = parseInt(hStr, 10);
    const minutes = mStr;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const formattedHours = String(hours).padStart(2, '0');
    return `${formattedHours}:${minutes} ${ampm}`;
  };

  const handleSubmit = (formData) => {
    setError(null);
    setIsLoading(true);
    const formattedTime = formatTimeToAMPM(formData.preferredTime);

    const payload = {
      studentId: student.studentId,
      studentName: student.name,
      studentEmail: student.email,
      mentorName: student.mentor?.name || 'Dr. Archana J R',
      mentorEmail: student.mentor?.email || 'archanajr@rnsitmba.ac.in',
      counsellorId: 'leenac',
      counsellorName: 'Dr. Leena C',
      counsellorEmail: 'leenac@rnsit.ac.in',
      mode: formData.mode,
      preferredDate: formData.preferredDate,
      preferredTime: formattedTime,
      reason: formData.reason,
      priority: formData.priority
    };

    fetch(`${API_URL}/api/counselling/book`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify(payload)
    })

      .then(async (response) => {
        const data = await response.json();
        setIsLoading(false);

        if (response.ok && data.success) {
          // Sync booking local state queue
          const newTicket = {
            ticketId: data.appointmentId,
            studentId: student.studentId,
            studentName: student.name,
            preferredDate: formData.preferredDate,
            preferredTime: formattedTime,
            reason: formData.reason,
            priority: formData.priority,
            status: 'Submitted',
            submittedDate: new Date().toISOString().split('T')[0],
            mode: formData.mode,
            meetingLink: data.meetingLink
          };
          addTicket(newTicket);

          setTicketId(data.appointmentId);
          setSubmittedData({
            ...formData,
            preferredTime: formattedTime,
            meetingLink: data.meetingLink
          });
          setIsSubmitted(true);
        } else {
          if (data.errorType === 'GOOGLE_AUTH_REQUIRED') {
            setError('Google OAuth credentials are required before the real Calendar/Meet integration can be tested.');
          } else {
            setError(data.message || `I couldn't complete your ${formData.mode.toLowerCase()} counselling booking right now. Please try again.`);
          }
        }
      })
      .catch(() => {
        setIsLoading(false);
        setError(`I couldn't complete your ${formData.mode.toLowerCase()} counselling booking right now. The backend server appears to be offline. Please try again.`);
      });
  };

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <div className="counselling-booking">
      <div className="page-header">
        <h1>Counselling Session Booking</h1>
        <button 
          className="btn btn-secondary"
          onClick={handleBackToDashboard}
          disabled={isLoading}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="booking-content">
        {!isSubmitted ? (
          <>
            <div className="info-section">
              <h2>Request a Counselling Session</h2>
              <p>
                Use this form to request a counselling session with your assigned student counsellor. 
                Please provide your preferred date and time, along with a brief reason for the session.
              </p>
            </div>

            {error && (
              <div style={{ 
                padding: '15px', 
                backgroundColor: '#fde8e8', 
                color: '#e74c3c', 
                borderLeft: '4px solid #e74c3c', 
                borderRadius: '4px', 
                marginBottom: '20px', 
                fontWeight: '500' 
              }}>
                {error}
              </div>
            )}

            <BookingForm onSubmit={handleSubmit} isLoading={isLoading} />
          </>
        ) : (
          <>
            <ConfirmationCard 
              ticketId={ticketId}
              priority={submittedData.priority}
              formData={submittedData}
            />
            <div className="action-buttons">
              <button 
                className="btn btn-primary"
                onClick={handleBackToDashboard}
              >
                Return to Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CounsellingBooking;
