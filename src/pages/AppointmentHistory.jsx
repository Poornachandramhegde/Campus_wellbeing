
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = `${import.meta.env.VITE_API_URL || ''}/api`;

// Convert appointment date into a JavaScript Date
const getAppointmentDate = (appointment) => {
  if (!appointment.preferredDate) {
    return null;
  }

  const date = new Date(appointment.preferredDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

// Check whether an appointment is in the past
const isPastAppointment = (appointment) => {
  const appointmentDate = getAppointmentDate(appointment);

  if (!appointmentDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  appointmentDate.setHours(0, 0, 0, 0);

  return appointmentDate < today;
};

// Check whether an appointment is upcoming
const isUpcomingAppointment = (appointment) => {
  const appointmentDate = getAppointmentDate(appointment);

  if (!appointmentDate) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  appointmentDate.setHours(0, 0, 0, 0);

  return appointmentDate >= today;
};

// Normalize status for filtering
const normalizeStatus = (status) => {
  const normalized = String(status || '')
    .trim()
    .toLowerCase();

  if (
    normalized === 'submitted' ||
    normalized === 'booked' ||
    normalized === 'confirmed' ||
    normalized === 'approved'
  ) {
    return 'booked';
  }

  if (normalized === 'completed') {
    return 'completed';
  }

  if (
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'rejected'
  ) {
    return 'cancelled';
  }

  return normalized || 'unknown';
};

// Display a readable status
const getStatusLabel = (status) => {
  if (!status) return 'Unknown';

  return String(status).charAt(0).toUpperCase() +
    String(status).slice(1);
};

// Select CSS class based on appointment status
const getStatusClass = (status) => {
  const normalizedStatus = normalizeStatus(status);

  if (normalizedStatus === 'booked') {
    return 'appointment-status status-confirmed';
  }

  if (normalizedStatus === 'completed') {
    return 'appointment-status status-completed';
  }

  if (normalizedStatus === 'cancelled') {
    return 'appointment-status status-cancelled';
  }

  return 'appointment-status';
};

const AppointmentHistory = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch appointment history
  useEffect(() => {
    const fetchAppointmentHistory = async () => {
      try {
        setIsLoading(true);
        setError('');

        const response = await fetch(
          `${API_BASE}/counselling/my-history`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || 'Unable to load appointment history.'
          );
        }

        setAppointments(data.appointments || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchAppointmentHistory();
    } else {
      setIsLoading(false);
      setError('Please log in to view your appointment history.');
    }
  }, [token]);

  // Apply the selected filter
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const status = normalizeStatus(appointment.status);

      switch (activeFilter) {
        case 'upcoming':
          return isUpcomingAppointment(appointment);

        case 'past':
          return isPastAppointment(appointment);

        case 'booked':
          return status === 'booked';

        case 'completed':
          return status === 'completed';

        case 'cancelled':
          return status === 'cancelled';

        case 'all':
        default:
          return true;
      }
    });
  }, [appointments, activeFilter]);

  // Display filter count
  const getFilterCount = (filter) => {
    return appointments.filter((appointment) => {
      const status = normalizeStatus(appointment.status);

      switch (filter) {
        case 'upcoming':
          return isUpcomingAppointment(appointment);

        case 'past':
          return isPastAppointment(appointment);

        case 'booked':
          return status === 'booked';

        case 'completed':
          return status === 'completed';

        case 'cancelled':
          return status === 'cancelled';

        case 'all':
        default:
          return true;
      }
    }).length;
  };

  const filters = [
    { key: 'all', label: 'All Appointments' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'past', label: 'Past' },
    { key: 'booked', label: 'Booked' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="appointment-history-page">

      {/* Page Header */}
      <div className="history-header">
        <div>
          <h1>Appointment History</h1>
          <p>
            View and manage your counselling appointment records.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={() => navigate('/')}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Filter Buttons */}
      <div className="appointment-filters">
        {filters.map((filter) => (
          <button
            key={filter.key}
            className={
              activeFilter === filter.key
                ? 'history-filter active'
                : 'history-filter'
            }
            onClick={() => setActiveFilter(filter.key)}
          >
            {filter.label}
            <span className="filter-count">
              {getFilterCount(filter.key)}
            </span>
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="history-message">
          Loading your appointments...
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="history-error">
          {error}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAppointments.length === 0 && (
        <div className="history-empty">
          <h2>No Appointments Found</h2>

          <p>
            There are no appointments matching the selected filter.
          </p>

          {activeFilter !== 'all' ? (
            <button
              className="btn btn-secondary"
              onClick={() => setActiveFilter('all')}
            >
              View All Appointments
            </button>
          ) : (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/counselling-booking')}
            >
              Book an Appointment
            </button>
          )}
        </div>
      )}

      {/* Appointment Cards */}
      {!isLoading && !error && filteredAppointments.length > 0 && (
        <div className="appointments-list">
          {filteredAppointments.map((appointment) => (
            <div
              className="appointment-history-card"
              key={appointment.appointmentId}
            >
              <div className="appointment-card-header">
                <div>
                  <h2>Counselling Appointment</h2>

                  <p className="appointment-id">
                    ID: {appointment.appointmentId}
                  </p>
                </div>

                <span
                  className={getStatusClass(appointment.status)}
                >
                  {getStatusLabel(appointment.status)}
                </span>
              </div>

              <div className="appointment-summary">
                <div>
                  <span className="summary-label">Counsellor</span>
                  <strong>
                    {appointment.counsellorName || 'Not assigned'}
                  </strong>
                </div>

                <div>
                  <span className="summary-label">Date</span>
                  <strong>
                    {appointment.preferredDate || 'Not available'}
                  </strong>
                </div>

                <div>
                  <span className="summary-label">Time</span>
                  <strong>
                    {appointment.preferredTime || 'Not available'}
                  </strong>
                </div>

                <div>
                  <span className="summary-label">Mode</span>
                  <strong>
                    {appointment.mode || 'Not specified'}
                  </strong>
                </div>
              </div>

              <div className="appointment-card-actions">
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    setSelectedAppointment(appointment)
                  }
                >
                  View Full Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div
          className="appointment-modal-overlay"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="appointment-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="appointment-modal-header">
              <div>
                <h2>Appointment Details</h2>
                <p>
                  {selectedAppointment.appointmentId}
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={() => setSelectedAppointment(null)}
                aria-label="Close appointment details"
              >
                ×
              </button>
            </div>

            <div className="appointment-modal-content">
              <div className="modal-status-row">
                <span>Status</span>

                <span
                  className={getStatusClass(
                    selectedAppointment.status
                  )}
                >
                  {getStatusLabel(selectedAppointment.status)}
                </span>
              </div>

              <div className="modal-detail-row">
                <span>Counsellor</span>
                <strong>
                  {selectedAppointment.counsellorName ||
                    'Not assigned'}
                </strong>
              </div>

              <div className="modal-detail-row">
                <span>Counsellor Email</span>
                <strong>
                  {selectedAppointment.counsellorEmail ||
                    'Not available'}
                </strong>
              </div>

              <div className="modal-detail-row">
                <span>Date</span>
                <strong>
                  {selectedAppointment.preferredDate ||
                    'Not available'}
                </strong>
              </div>

              <div className="modal-detail-row">
                <span>Time</span>
                <strong>
                  {selectedAppointment.preferredTime ||
                    'Not available'}
                </strong>
              </div>

              <div className="modal-detail-row">
                <span>Session Mode</span>
                <strong>
                  {selectedAppointment.mode ||
                    'Not specified'}
                </strong>
              </div>

              <div className="modal-detail-row">
                <span>Priority</span>
                <strong>
                  {selectedAppointment.priority ||
                    'Not specified'}
                </strong>
              </div>

              <div className="modal-detail-row modal-detail-column">
                <span>Reason for Appointment</span>
                <p>
                  {selectedAppointment.reason ||
                    'Not provided'}
                </p>
              </div>

              <div className="modal-detail-row">
                <span>Student Name</span>
                <strong>
                  {selectedAppointment.studentName ||
                    'Not available'}
                </strong>
              </div>

              <div className="modal-detail-row">
                <span>Student Email</span>
                <strong>
                  {selectedAppointment.studentEmail ||
                    'Not available'}
                </strong>
              </div>

              <div className="modal-detail-row">
                <span>Booked On</span>
                <strong>
                  {selectedAppointment.createdAt
                    ? new Date(
                        selectedAppointment.createdAt
                      ).toLocaleString()
                    : 'Not available'}
                </strong>
              </div>

              {selectedAppointment.meetingLink && (
                <div className="modal-detail-row">
                  <span>Online Meeting</span>

                  <a
                    href={selectedAppointment.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
            </div>

            <div className="appointment-modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setSelectedAppointment(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentHistory;