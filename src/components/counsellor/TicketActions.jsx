import React, { useState } from 'react';
import CloseTicketForm from './CloseTicketForm';
import '../../styles.css';

const TicketActions = ({ ticket, onStatusUpdate, onCloseTicket }) => {
  const [showCloseForm, setShowCloseForm] = useState(false);

  const handleAccept = () => {
    onStatusUpdate(ticket.ticketId, 'Accepted');
  };

  const handleReschedule = () => {
    onStatusUpdate(ticket.ticketId, 'Rescheduled');
  };

  const handleReject = () => {
    if (window.confirm('Are you sure you want to reject this counselling request?')) {
      onStatusUpdate(ticket.ticketId, 'Rejected');
    }
  };

  const handleClose = () => {
    setShowCloseForm(true);
  };

  const handleCloseFormSubmit = (notes) => {
    onCloseTicket(ticket.ticketId, notes);
    setShowCloseForm(false);
  };

  const handleCloseFormCancel = () => {
    setShowCloseForm(false);
  };

  // Don't show actions for completed or rejected tickets
  if (ticket.status === 'Completed' || ticket.status === 'Rejected') {
    return (
      <div className="ticket-actions">
        <p className="action-disabled">
          {ticket.status === 'Completed' 
            ? 'This ticket has been completed.' 
            : 'This ticket has been rejected.'}
        </p>
      </div>
    );
  }

  return (
    <div className="ticket-actions">
      {showCloseForm ? (
        <CloseTicketForm
          onSubmit={handleCloseFormSubmit}
          onCancel={handleCloseFormCancel}
        />
      ) : (
        <>
          {ticket.status === 'Submitted' && (
            <>
              <button
                className="btn btn-success"
                onClick={handleAccept}
              >
                Accept
              </button>
              <button
                className="btn btn-warning"
                onClick={handleReschedule}
              >
                Reschedule
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
              >
                Reject
              </button>
            </>
          )}

          {ticket.status === 'Accepted' && (
            <button
              className="btn btn-primary"
              onClick={handleClose}
            >
              Close Ticket
            </button>
          )}

          {ticket.status === 'Rescheduled' && (
            <>
              <button
                className="btn btn-success"
                onClick={handleAccept}
              >
                Accept
              </button>
              <button
                className="btn btn-danger"
                onClick={handleReject}
              >
                Reject
              </button>
            </>
          )}
        </>
      )}
    </div>
  );
};

export default TicketActions;

