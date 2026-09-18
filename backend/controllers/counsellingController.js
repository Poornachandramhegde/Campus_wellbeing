const fs = require('fs');
const path = require('path');
const { createCalendarEvent } = require('../services/googleCalendarService');
const { hasAuth } = require('../config/googleAuth');
const { sendOnlineBookingEmails, sendOfflineBookingEmails } = require('../services/emailService');
const pool = require('../config/db');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_PATH = path.join(DATA_DIR, 'appointments.json');

// Ensure database file exists
const initDb = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, '[]', 'utf8');
  }
};

const getAppointments = () => {
  initDb();
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading appointments DB:', err);
    return [];
  }
};

const saveAppointments = (appointments) => {
  initDb();
  fs.writeFileSync(DB_PATH, JSON.stringify(appointments, null, 2), 'utf8');
};

const bookCounselling = async (req, res) => {
  let {
    studentId,
    studentName,
    studentEmail,
    mentorName,
    mentorEmail,
    counsellorId,
    counsellorName,
    counsellorEmail,
    mode,
    preferredDate,
    preferredTime,
    reason,
    priority
  } = req.body;

  // If user is authenticated, enforce identity from DB (do not trust user-supplied student_id)
  if (req.user && req.user.id) {
    try {
      const [userRows] = await pool.query(
        'SELECT id, name, usn, email, mentor_name, mentor_email FROM users WHERE id = ? LIMIT 1',
        [req.user.id]
      );
      if (userRows.length > 0) {
        const user = userRows[0];
        studentId = user.usn || String(user.id);
        studentName = user.name;
        studentEmail = user.email;
        mentorName = user.mentor_name || mentorName || 'Dr. Archana J R';
        mentorEmail = user.mentor_email || mentorEmail || 'archanajr@rnsitmba.ac.in';
      }
    } catch (dbErr) {
      console.error('Error retrieving authenticated student details for booking:', dbErr);
    }
  }

  // Default counsellor to Dr. Leena C if not explicitly passed
  counsellorId = counsellorId || 'leenac';
  counsellorName = counsellorName || 'Dr. Leena C';
  counsellorEmail = counsellorEmail || 'leenac@rnsit.ac.in';
  mentorName = mentorName || 'Dr. Archana J R';
  mentorEmail = mentorEmail || 'archanajr@rnsitmba.ac.in';

  // Validation
  if (
    !studentId ||
    !studentName ||
    !studentEmail ||
    !counsellorId ||
    !counsellorName ||
    !counsellorEmail ||
    !mode ||
    !preferredDate ||
    !preferredTime ||
    !reason ||
    !priority
  ) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required to book a session.'
    });
  }


  // Validate mode
  const validModes = ['Offline', 'Online'];
  if (!validModes.includes(mode)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid mode. Must be Online or Offline.'
    });
  }

  // Check duplicate booking protection (check local JSON DB for identical slot)
  const existingAppointments = getAppointments();
  const duplicate = existingAppointments.find(
    (app) =>
      app.counsellorEmail === counsellorEmail &&
      app.preferredDate === preferredDate &&
      app.preferredTime === preferredTime &&
      app.status !== 'Rejected'
  );

  if (duplicate) {
    return res.status(409).json({
      success: false,
      message: 'This slot is already booked for the selected counsellor.'
    });
  }

  const appointmentId = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  let calendarEventId = null;
  let meetingLink = null;

  // If ONLINE mode, call Google Calendar Service
  if (mode === 'Online') {
    // Check credentials first
    if (!hasAuth()) {
      return res.status(401).json({
        success: false,
        errorType: 'GOOGLE_AUTH_REQUIRED',
        message: 'Google OAuth credentials are required before the real Calendar/Meet integration can be tested.'
      });
    }

    try {
      const googleResult = await createCalendarEvent({
        studentName,
        studentEmail,
        counsellorName,
        counsellorEmail,
        preferredDate,
        preferredTime,
        reason,
        priority
      });
      calendarEventId = googleResult.calendarEventId;
      meetingLink = googleResult.meetingLink;
    } catch (error) {
      if (error.code === 'GOOGLE_AUTH_REQUIRED') {
        return res.status(401).json({
          success: false,
          errorType: 'GOOGLE_AUTH_REQUIRED',
          message: error.message
        });
      }
      return res.status(500).json({
        success: false,
        message: error.message || 'Failed to create Google Calendar event.'
      });
    }
  }

  // Persist appointment
  const newAppointment = {
    appointmentId,
    studentId,
    studentName,
    studentEmail,
    mentorName,
    mentorEmail,
    counsellorId,
    counsellorName,
    counsellorEmail,
    mode,
    preferredDate,
    preferredTime,
    reason,
    priority,
    status: 'Submitted',
    calendarEventId,
    meetingLink,
    createdAt: new Date().toISOString()
  };

  existingAppointments.unshift(newAppointment);
  saveAppointments(existingAppointments);

  // Trigger email dispatch in transaction sequence post-persistence
  let emailStatus = { student: 'skipped', counsellor: 'skipped', academicMentor: 'skipped' };
  try {
    if (mode === 'Online') {
      emailStatus = await sendOnlineBookingEmails(newAppointment);
    } else {
      emailStatus = await sendOfflineBookingEmails(newAppointment);
    }
  } catch (emailErr) {
    console.error('[EMAIL SYSTEM ERROR] Critical failure inside email service dispatch:', emailErr);
  }

  return res.status(201).json({
    success: true,
    appointmentId,
    calendarEventId,
    meetingLink,
    emailStatus,
    message: 'Counselling session successfully booked.'
  });
};

const getAppointmentsList = (req, res) => {
  const appointments = getAppointments();
  return res.json(appointments);
};

module.exports = {
  bookCounselling,
  getAppointmentsList
};
