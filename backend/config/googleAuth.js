const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, '..', 'oauth.json');

const getOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUri
  );

  // Load tokens if they exist
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const tokens = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
      oauth2Client.setCredentials(tokens);
    } catch (err) {
      console.error('Error reading oauth.json token:', err);
    }
  }

  return oauth2Client;
};

const hasAuth = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return false;
  }

  return fs.existsSync(TOKEN_PATH);
};

const saveTokens = (tokens) => {
  try {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving oauth.json token:', err);
  }
};

const clearTokens = () => {
  try {
    if (fs.existsSync(TOKEN_PATH)) {
      fs.unlinkSync(TOKEN_PATH);
    }
  } catch (err) {
    console.error('Error removing expired oauth.json:', err);
  }
};

module.exports = {
  getOAuthClient,
  hasAuth,
  saveTokens,
  clearTokens,
  TOKEN_PATH
};
