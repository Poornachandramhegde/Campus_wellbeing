import React from 'react';
import '../styles.css';

const CounsellorCard = ({ counsellor }) => {
  return (
    <div className="card counsellor-card">
      <h3>Student Counsellor</h3>
      <div className="counsellor-info">
        <p><strong>Name:</strong> {counsellor.name}</p>
        <p><strong>Email:</strong> {counsellor.email}</p>
        <p><strong>Office Hours:</strong> {counsellor.officeHours}</p>
        <p className="privacy-notice">
          <em>Your request is confidential and visible only to authorized counsellors.</em>
        </p>
      </div>
    </div>
  );
};

export default CounsellorCard;

