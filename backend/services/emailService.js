const nodemailer = require('nodemailer');

const getTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465', 10);
  const secure = process.env.SMTP_SECURE === 'true';
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
};

const sendOnlineBookingEmails = async (appointment) => {
  const transporter = getTransporter();
  const status = { student: 'failed', counsellor: 'failed', academicMentor: 'failed' };

  if (!transporter) {
    console.warn('[EMAIL SERVICE] SMTP credentials (SMTP_USER/SMTP_PASSWORD) are not configured. Skipping email dispatch.');
    return status;
  }

  // 1. Email Student
  try {
    await transporter.sendMail({
      from: `"College Counselling System" <${process.env.SMTP_USER}>`,
      to: appointment.studentEmail,
      subject: 'Online Counselling Session Confirmed - College Counselling System',
      text: `Dear ${appointment.studentName},

Your online counselling session has been successfully scheduled.

Counsellor: ${appointment.counsellorName}
Date: ${appointment.preferredDate}
Time: ${appointment.preferredTime}
Mode: Online
Reason: ${appointment.reason}
Priority: ${appointment.priority}

Google Meet:
${appointment.meetingLink}

Appointment ID:
${appointment.appointmentId}

Please join the meeting at the scheduled time.

Regards,
College Counselling System`
    });
    status.student = 'sent';
    console.log(`[EMAIL] Student notification sent to ${appointment.studentEmail}`);
  } catch (err) {
    console.error(`[EMAIL] Student notification failed: ${err.message}`);
  }

  // 2. Email Counsellor
  try {
    await transporter.sendMail({
      from: `"College Counselling System" <${process.env.SMTP_USER}>`,
      to: appointment.counsellorEmail,
      subject: `New Online Counselling Appointment - ${appointment.studentName}`,
      text: `Dear ${appointment.counsellorName},

A new online counselling session has been scheduled.

Student: ${appointment.studentName}
Student Email: ${appointment.studentEmail}
Date: ${appointment.preferredDate}
Time: ${appointment.preferredTime}
Reason: ${appointment.reason}
Priority: ${appointment.priority}

Google Meet:
${appointment.meetingLink}

Appointment ID:
${appointment.appointmentId}

Regards,
College Counselling System`
    });
    status.counsellor = 'sent';
    console.log(`[EMAIL] Counsellor notification sent to ${appointment.counsellorEmail}`);
  } catch (err) {
    console.error(`[EMAIL] Counsellor notification failed: ${err.message}`);
  }

  // 3. Email Academic Mentor (Without Meet link)
  try {
    const mentorEmail = appointment.mentorEmail || (appointment.academicMentor && appointment.academicMentor.email);
    const mentorName = appointment.mentorName || (appointment.academicMentor && appointment.academicMentor.name) || 'Academic Mentor';
    
    if (mentorEmail) {
      await transporter.sendMail({
        from: `"College Counselling System" <${process.env.SMTP_USER}>`,
        to: mentorEmail,
        subject: `Counselling Session Scheduled - ${appointment.studentName}`,
        text: `Dear ${mentorName},

This is to inform you that a counselling session has been scheduled for the following student.

Student: ${appointment.studentName}
Counsellor: ${appointment.counsellorName}
Date: ${appointment.preferredDate}
Time: ${appointment.preferredTime}
Mode: Online
Reason: ${appointment.reason}
Priority: ${appointment.priority}
Appointment ID: ${appointment.appointmentId}

This notification is for academic coordination purposes.

Regards,
College Counselling System`
      });
      status.academicMentor = 'sent';
      console.log(`[EMAIL] Academic mentor notification sent to ${mentorEmail}`);
    } else {
      console.warn('[EMAIL] Academic mentor email is missing from appointment request.');
    }
  } catch (err) {
    console.error(`[EMAIL] Academic mentor notification failed: ${err.message}`);
  }

  return status;
};

const sendOfflineBookingEmails = async (appointment) => {
  const transporter = getTransporter();
  const status = { student: 'failed', counsellor: 'failed', academicMentor: 'failed' };

  if (!transporter) {
    console.warn('[EMAIL SERVICE] SMTP credentials (SMTP_USER/SMTP_PASSWORD) are not configured. Skipping email dispatch.');
    return status;
  }

  // 1. Email Student (Without Meet link, includes physical office details)
  try {
    await transporter.sendMail({
      from: `"College Counselling System" <${process.env.SMTP_USER}>`,
      to: appointment.studentEmail,
      subject: 'Offline Counselling Session Confirmed - College Counselling System',
      text: `Dear ${appointment.studentName},

Your offline counselling session has been successfully scheduled.

Counsellor: ${appointment.counsellorName}
Date: ${appointment.preferredDate}
Time: ${appointment.preferredTime}
Mode: Offline
Reason: ${appointment.reason}
Priority: ${appointment.priority}

Appointment ID:
${appointment.appointmentId}

Physical Office Info:
Counselling Room 102, Main Admin Block.

Regards,
College Counselling System`
    });
    status.student = 'sent';
    console.log(`[EMAIL] Student notification sent to ${appointment.studentEmail}`);
  } catch (err) {
    console.error(`[EMAIL] Student notification failed: ${err.message}`);
  }

  // 2. Email Counsellor
  try {
    await transporter.sendMail({
      from: `"College Counselling System" <${process.env.SMTP_USER}>`,
      to: appointment.counsellorEmail,
      subject: `New Offline Counselling Appointment - ${appointment.studentName}`,
      text: `Dear ${appointment.counsellorName},

A new offline counselling session has been scheduled.

Student: ${appointment.studentName}
Student Email: ${appointment.studentEmail}
Date: ${appointment.preferredDate}
Time: ${appointment.preferredTime}
Reason: ${appointment.reason}
Priority: ${appointment.priority}

Appointment ID:
${appointment.appointmentId}

Regards,
College Counselling System`
    });
    status.counsellor = 'sent';
    console.log(`[EMAIL] Counsellor notification sent to ${appointment.counsellorEmail}`);
  } catch (err) {
    console.error(`[EMAIL] Counsellor notification failed: ${err.message}`);
  }

  // 3. Email Academic Mentor (Without Meet link)
  try {
    const mentorEmail = appointment.mentorEmail || (appointment.academicMentor && appointment.academicMentor.email);
    const mentorName = appointment.mentorName || (appointment.academicMentor && appointment.academicMentor.name) || 'Academic Mentor';
    
    if (mentorEmail) {
      await transporter.sendMail({
        from: `"College Counselling System" <${process.env.SMTP_USER}>`,
        to: mentorEmail,
        subject: `Counselling Session Scheduled - ${appointment.studentName}`,
        text: `Dear ${mentorName},

This is to inform you that a counselling session has been scheduled for the following student.

Student: ${appointment.studentName}
Counsellor: ${appointment.counsellorName}
Date: ${appointment.preferredDate}
Time: ${appointment.preferredTime}
Mode: Offline
Reason: ${appointment.reason}
Priority: ${appointment.priority}
Appointment ID: ${appointment.appointmentId}

This notification is for academic coordination purposes.

Regards,
College Counselling System`
      });
      status.academicMentor = 'sent';
      console.log(`[EMAIL] Academic mentor notification sent to ${mentorEmail}`);
    } else {
      console.warn('[EMAIL] Academic mentor email is missing from appointment request.');
    }
  } catch (err) {
    console.error(`[EMAIL] Academic mentor notification failed: ${err.message}`);
  }

  return status;
};

module.exports = {
  sendOnlineBookingEmails,
  sendOfflineBookingEmails
};
