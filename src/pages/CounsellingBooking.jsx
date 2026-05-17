import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import ConfirmationCard from '../components/ConfirmationCard';
import '../styles.css';

const CounsellingBooking = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  const generateTicketId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `TKT-${timestamp}-${random}`;
  };

  const handleSubmit = (formData) => {
    const newTicketId = generateTicketId();
    setTicketId(newTicketId);
    setSubmittedData(formData);
    setIsSubmitted(true);
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
            <BookingForm onSubmit={handleSubmit} />
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

