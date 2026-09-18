const express = require('express');
const router = express.Router();
const { bookCounselling, getAppointmentsList } = require('../controllers/counsellingController');
const { getOAuthClient, saveTokens } = require('../config/googleAuth');
const authMiddleware = require('../middleware/authMiddleware');
const db = require('../config/db');

// Test database connection endpoint
router.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT DATABASE() AS database_name;');
    const databaseName = rows && rows.length > 0 ? rows[0].database_name : null;
    return res.status(200).json({
      success: true,
      message: 'MySQL connection successful',
      database: databaseName
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({
      success: false,
      message: 'Database connection failed: ' + error.message
    });
  }
});

router.post('/counselling/book', authMiddleware, bookCounselling);
router.get('/counselling/list', getAppointmentsList);


// Google Auth Redirect Route
router.get('/auth/google', (req, res) => {
  const oauth2Client = getOAuthClient();
  if (!oauth2Client) {
    return res.status(500).json({
      success: false,
      message: 'Google Client credentials are not configured in backend/.env.'
    });
  }

  // Scopes required for calendar inserts and meeting creations
  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline', // Get refresh_token for automatic token renewal
    scope: scopes,
    prompt: 'consent' // Request consent screen to force new refresh token
  });

  return res.redirect(authUrl);
});

// Google Auth Callback Route
router.get('/auth/google/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send('<h3>Authorization code is missing.</h3>');
  }

  const oauth2Client = getOAuthClient();
  if (!oauth2Client) {
    return res.status(500).send('<h3>Google credentials are not configured in backend/.env.</h3>');
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);
    saveTokens(tokens);
    return res.send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h2 style="color: #27ae60;">✓ Google OAuth Authentication Successful</h2>
        <p>Tokens have been successfully saved to <code>oauth.json</code>.</p>
        <p>You can now return to the ERP application and test the Online counselling booking workflow.</p>
        <button onclick="window.close()" style="padding: 10px 20px; font-size: 1rem; border: none; border-radius: 5px; background: #3498db; color: white; cursor: pointer;">Close Window</button>
      </div>
    `);
  } catch (error) {
    console.error('Error exchanging OAuth code:', error);
    return res.status(500).send(`<h3>Authentication failed: ${error.message}</h3>`);
  }
});

module.exports = router;
