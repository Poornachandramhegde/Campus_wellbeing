import React from 'react';
import TicketActions from './TicketActions';
import '../../styles.css';

const TicketCard = ({ ticket, onStatusUpdate, onCloseTicket }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return '#e74c3c';
      case 'Medium':
        return '#f39c12';
      case 'Low':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Submitted':
        return '#3498db';
      case 'Accepted':
        return '#27ae60';
      case 'Rescheduled':
        return '#f39c12';
      case 'Rejected':
        return '#e74c3c';
      case 'Completed':
        return '#7f8c8d';
      default:
        return '#95a5a6';
    }
  };

  const getSLA = (priority) => {
    switch (priority) {
      case 'High':
        return '24 hours';
      case 'Medium':
        return '2–3 days';
      case 'Low':
        return '7 working days';
      default:
        return '7 working days';
    }
  };

  return (
    <div className="ticket-card">
      <div className="ticket-header">
        <div className="ticket-id-section">
          <span className="ticket-id-label">Ticket ID:</span>
          <span className="ticket-id-value">{ticket.ticketId}</span>
        </div>
        <div className="ticket-badges">
          <span
            className="priority-badge"
            style={{ backgroundColor: getPriorityColor(ticket.priority) }}
          >
            {ticket.priority}
          </span>
          <span
            className="status-badge"
            style={{ backgroundColor: getStatusColor(ticket.status) }}
          >
            {ticket.status}
          </span>
        </div>
      </div>

      <div className="ticket-body">
        <div className="ticket-info-row">
          <div className="info-item">
            <strong>Student ID:</strong> {ticket.studentId}
          </div>
          <div className="info-item">
            <strong>Student Name:</strong> {ticket.studentName}
          </div>
        </div>

        <div className="ticket-info-row">
          <div className="info-item">
            <strong>Preferred Date:</strong> {ticket.preferredDate}
          </div>
          <div className="info-item">
            <strong>Preferred Time:</strong> {ticket.preferredTime}
          </div>
        </div>

        <div className="ticket-reason">
          <strong>Reason for Counselling:</strong>
          <p>{ticket.reason}</p>
        </div>

        {ticket.status === 'Accepted' && (
          <div className="sla-display">
            <strong>SLA Target:</strong> Response within {getSLA(ticket.priority)}
          </div>
        )}

        {ticket.guidanceNotes && (
          <div className="guidance-notes">
            <strong>Guidance Notes:</strong>
            <p>{ticket.guidanceNotes}</p>
          </div>
        )}
      </div>

      <div className="ticket-footer">
        <TicketActions
          ticket={ticket}
          onStatusUpdate={onStatusUpdate}
          onCloseTicket={onCloseTicket}
        />
      </div>
    </div>
  );
};

export default TicketCard;

