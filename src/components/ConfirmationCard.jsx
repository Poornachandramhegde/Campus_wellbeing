import React from 'react';
import '../styles.css';

const ConfirmationCard = ({ ticketId, priority, formData }) => {
  const getSLA = (priority) => {
    switch (priority) {
      case 'High':
        return 'Within 24 hours';
      case 'Medium':
        return '2–3 working days';
      case 'Low':
        return 'Within 7 working days';
      default:
        return 'Within 7 working days';
    }
  };

  return (
    <div className="confirmation-card">
      <div className="confirmation-header">
        <h2>✓ Request Submitted Successfully</h2>
      </div>
      
      <div className="ticket-details">
        <div className="ticket-info">
          <p><strong>Ticket ID:</strong> <span className="ticket-id">{ticketId}</span></p>
          <p><strong>Status:</strong> <span className="status-badge submitted">Submitted</span></p>
        </div>

        <div className="request-summary">
          <h3>Request Summary</h3>
          <p><strong>Preferred Date:</strong> {formData.preferredDate}</p>
          <p><strong>Preferred Time:</strong> {formData.preferredTime}</p>
          <p><strong>Priority:</strong> {formData.priority}</p>
        </div>

        <div className="sla-message">
          <h3>Expected Response Time</h3>
          <p className="sla-text">
            Based on your priority level (<strong>{formData.priority}</strong>), 
            you can expect a response: <strong>{getSLA(priority)}</strong>
          </p>
        </div>

        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>Your counsellor will review your request</li>
            <li>You will receive a confirmation email with session details</li>
            <li>You can check your request status in your dashboard</li>
          </ul>
        </div>

        <div className="privacy-notice-box">
          <p><strong>Privacy Reminder:</strong></p>
          <p>Your request is confidential and visible only to authorized counsellors.</p>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationCard;

