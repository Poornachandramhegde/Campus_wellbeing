import React, { useState } from 'react';
import '../styles.css';

const BookingForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    mode: 'Offline',
    preferredDate: '',
    preferredTime: '',
    reason: '',
    priority: 'Medium'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form className="booking-form" onSubmit={handleSubmit}>
      {/* Session Mode Selector */}
      <div className="form-group">
        <label>Session Mode *</label>
        <div style={{ display: 'flex', gap: '20px', marginTop: '6px', marginBottom: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', cursor: 'pointer' }}>
            <input
              type="radio"
              name="mode"
              value="Offline"
              checked={formData.mode === 'Offline'}
              onChange={handleChange}
              disabled={isLoading}
            />
            Offline Counselling (In-Person)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'normal', cursor: 'pointer' }}>
            <input
              type="radio"
              name="mode"
              value="Online"
              checked={formData.mode === 'Online'}
              onChange={handleChange}
              disabled={isLoading}
            />
            Online Counselling (Google Meet)
          </label>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="preferredDate">Preferred Date *</label>
        <input
          type="date"
          id="preferredDate"
          name="preferredDate"
          value={formData.preferredDate}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="preferredTime">Preferred Time *</label>
        <input
          type="time"
          id="preferredTime"
          name="preferredTime"
          value={formData.preferredTime}
          onChange={handleChange}
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="reason">Reason for Counselling *</label>
        <textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          rows="5"
          placeholder="Please share what you'd like to discuss (this information is confidential)"
          required
          disabled={isLoading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="priority">Priority Level *</label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          required
          disabled={isLoading}
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <small className="priority-help">
          High: Urgent support needed | Medium: Standard request | Low: General inquiry
        </small>
      </div>

      <div className="privacy-notice-box">
        <p><strong>Privacy Notice:</strong></p>
        <p>Your request is confidential and visible only to authorized counsellors.</p>
      </div>

      <button type="submit" className="btn btn-primary" disabled={isLoading}>
        {isLoading ? 'Booking Online Session...' : 'Raise Counselling Request'}
      </button>
    </form>
  );
};

export default BookingForm;

