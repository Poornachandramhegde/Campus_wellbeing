import React, { useState } from 'react';
import '../../styles.css';

const CloseTicketForm = ({ onSubmit, onCancel }) => {
  const [notes, setNotes] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (notes.trim()) {
      onSubmit(notes);
      setNotes('');
    } else {
      alert('Please provide guidance notes before closing the ticket.');
    }
  };

  return (
    <div className="close-ticket-form">
      <h4>Close Ticket</h4>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="guidanceNotes">
            Session Summary / Closing Notes *
          </label>
          <textarea
            id="guidanceNotes"
            name="guidanceNotes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="6"
            placeholder="Enter guidance notes and session summary..."
            required
          />
          <small className="form-help">
            Provide a summary of the session and any guidance provided.
          </small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            Submit & Close Ticket
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CloseTicketForm;

