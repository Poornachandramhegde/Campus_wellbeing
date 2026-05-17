import React, { useState } from 'react';
import '../styles.css';

const BookingForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
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
      <div className="form-group">
        <label htmlFor="preferredDate">Preferred Date *</label>
        <input
          type="date"
          id="preferredDate"
          name="preferredDate"
          value={formData.preferredDate}
          onChange={handleChange}
          required
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

      <button type="submit" className="btn btn-primary">
        Raise Counselling Request
      </button>
    </form>
  );
};

export default BookingForm;

