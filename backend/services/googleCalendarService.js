const { google } = require('googleapis');
const { getOAuthClient, hasAuth, clearTokens } = require('../config/googleAuth');

const createCalendarEvent = async (booking) => {
  if (!hasAuth()) {
    throw {
      code: 'GOOGLE_AUTH_REQUIRED',
      message: 'Google OAuth credentials are required before the real Calendar/Meet integration can be tested.'
    };
  }

  const oauth2Client = getOAuthClient();
  const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

  // Parse time ("11:00 AM" or "02:30 PM") and date ("2026-08-25")
  const timeMatch = booking.preferredTime.match(/^(\d{2}):(\d{2})\s*(AM|PM)$/i);
  if (!timeMatch) {
    throw new Error(`Invalid preferredTime format: ${booking.preferredTime}`);
  }

  let hours = parseInt(timeMatch[1], 10);
  const minutes = parseInt(timeMatch[2], 10);
  const ampm = timeMatch[3].toUpperCase();

  if (ampm === 'PM' && hours < 12) {
    hours += 12;
  }
  if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }

  // Formatting offset (Default to Asia/Kolkata +05:30)
  const offset = '+05:30';
  const timezone = process.env.COUNSELLING_TIMEZONE || 'Asia/Kolkata';

  // Construct start timestamp
  const startStr = `${booking.preferredDate}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00${offset}`;
  
  // Calculate end timestamp (Add 45 minutes default duration)
  let endHours = hours;
  let endMinutes = minutes + 45;
  if (endMinutes >= 60) {
    endHours += 1;
    endMinutes -= 60;
  }
  const endStr = `${booking.preferredDate}T${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}:00${offset}`;

  const event = {
    summary: 'Student Counselling Session',
    description: `Counselling session booking requested via College ERP System.\n\nReason: ${booking.reason}\nPriority: ${booking.priority}`,
    start: {
      dateTime: startStr,
      timeZone: timezone,
    },
    end: {
      dateTime: endStr,
      timeZone: timezone,
    },
    attendees: [
      { email: booking.studentEmail, displayName: booking.studentName },
      { email: booking.counsellorEmail, displayName: booking.counsellorName }
    ],
    conferenceData: {
      createRequest: {
        requestId: `counselling-session-${Date.now()}`,
        conferenceSolutionKey: {
          type: 'hangoutsMeet'
        }
      }
    }
  };

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1, // Must be 1 to trigger Meet creation
      sendUpdates: 'all' // Sends automated Google Calendar invite emails
    });

    const eventData = response.data;
    const meetingLink = eventData.conferenceData?.entryPoints?.find(
      (ep) => ep.entryPointType === 'video'
    )?.uri;

    if (!meetingLink) {
      throw {
        code: 'GOOGLE_MEET_CREATION_FAILED',
        message: 'Google Calendar event was created, but Google Meet link generation failed.'
      };
    }

    return {
      calendarEventId: eventData.id,
      meetingLink: meetingLink
    };
  } catch (error) {
    console.error('Google Calendar API Error:', error);
    // Handle expired/revoked tokens (invalid_grant) or unauthorized errors
    if (
      error.code === 401 ||
      error.code === 'GOOGLE_AUTH_REQUIRED' ||
      error.response?.data?.error === 'invalid_grant' ||
      (error.message && error.message.includes('invalid_grant'))
    ) {
      clearTokens();
      throw {
        code: 'GOOGLE_AUTH_REQUIRED',
        message: 'Google OAuth token has expired or been revoked. Please re-authenticate at http://localhost:5000/api/auth/google.'
      };
    }
    throw error;
  }
};

module.exports = {
  createCalendarEvent
};
