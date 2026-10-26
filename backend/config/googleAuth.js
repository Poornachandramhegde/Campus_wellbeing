const { google } = require('googleapis');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const TOKEN_PATH = path.join(__dirname, '..', 'oauth.json');
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Derives a 32-byte key for AES-256-GCM.
 * Decodes 64-character hexadecimal string directly to 32 raw bytes.
 * For arbitrary passphrases, derives a consistent 32-byte key via SHA-256.
 */
const getEncryptionKey = () => {
  const secret = process.env.OAUTH_ENCRYPTION_KEY;
  if (!secret) {
    return null;
  }
  const trimmed = secret.trim();
  if (/^[0-9a-fA-F]{64}$/.test(trimmed)) {
    return Buffer.from(trimmed, 'hex');
  }
  return crypto.createHash('sha256').update(secret).digest();
};

const encryptTokens = (tokenObject) => {
  const key = getEncryptionKey();
  if (!key) {
    throw new Error('OAUTH_ENCRYPTION_KEY is required for encrypting tokens at rest.');
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const plaintext = JSON.stringify(tokenObject);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return {
    encryptedTokens: encrypted,
    iv: iv.toString('hex'),
    authTag
  };
};

const decryptTokens = (encryptedTokens, ivHex, authTagHex) => {
  const key = getEncryptionKey();
  if (!key) {
    throw new Error('OAUTH_ENCRYPTION_KEY is required for decrypting tokens.');
  }
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  let decrypted = decipher.update(encryptedTokens, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return JSON.parse(decrypted);
};

let tableInitPromise = null;
let isTableInitialized = false;

const initTokenTable = async () => {
  if (isTableInitialized) {
    return;
  }
  if (tableInitPromise) {
    return tableInitPromise;
  }

  tableInitPromise = (async () => {
    try {
      const createTableSql = `
        CREATE TABLE IF NOT EXISTS google_oauth_tokens (
          id INT AUTO_INCREMENT PRIMARY KEY,
          provider VARCHAR(50) NOT NULL UNIQUE DEFAULT 'google',
          account_email VARCHAR(255) NULL,
          encrypted_tokens TEXT NOT NULL,
          iv VARCHAR(64) NOT NULL,
          auth_tag VARCHAR(64) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `;
      await pool.query(createTableSql);
      isTableInitialized = true;
    } catch (err) {
      tableInitPromise = null;
      console.warn('[Google Auth DB Warning] Could not initialize google_oauth_tokens table:', err.message);
      throw err;
    }
  })();

  return tableInitPromise;
};

const loadTokens = async () => {
  // 1. Database check (primary for persistent production and when configured)
  if (isProduction || process.env.OAUTH_ENCRYPTION_KEY) {
    try {
      await initTokenTable();
      const [rows] = await pool.query(
        'SELECT encrypted_tokens, iv, auth_tag FROM google_oauth_tokens WHERE provider = ? LIMIT 1',
        ['google']
      );
      if (rows && rows.length > 0) {
        const row = rows[0];
        const tokens = decryptTokens(row.encrypted_tokens, row.iv, row.auth_tag);
        return tokens;
      }
      // If running in production and no token row found, do not fall back to local disk
      if (isProduction) {
        return null;
      }
    } catch (dbErr) {
      console.error('[Google Auth] Could not load tokens from database:', dbErr.message);
      if (isProduction) {
        throw dbErr;
      }
    }
  }

  // In production, never read local oauth.json fallback
  if (isProduction) {
    return null;
  }

  // 2. Local filesystem fallback (local development only)
  if (fs.existsSync(TOKEN_PATH)) {
    try {
      const fileData = fs.readFileSync(TOKEN_PATH, 'utf8');
      return JSON.parse(fileData);
    } catch (err) {
      console.error('[Google Auth] Error reading local oauth.json:', err.message);
    }
  }

  return null;
};

const saveTokens = async (tokens) => {
  if (!tokens || typeof tokens !== 'object') {
    return;
  }

  // Preserve existing tokens (e.g. refresh_token) when only refreshed access_token is supplied
  let existingTokens = null;
  try {
    existingTokens = await loadTokens();
  } catch (err) {
    // If loading failed in production, log safely and proceed to attempt saving
    console.warn('[Google Auth] Could not load existing tokens for merge:', err.message);
  }

  const mergedTokens = {
    ...(existingTokens || {}),
    ...tokens
  };

  // Protect against overwriting a valid existing refresh_token when incoming tokens omit or set it undefined/null
  if (!tokens.refresh_token && existingTokens && existingTokens.refresh_token) {
    mergedTokens.refresh_token = existingTokens.refresh_token;
  }

  // 1. Production / Persistent DB persistence
  if (isProduction || process.env.OAUTH_ENCRYPTION_KEY) {
    if (!process.env.OAUTH_ENCRYPTION_KEY) {
      throw new Error('OAUTH_ENCRYPTION_KEY is required for token persistence in production.');
    }

    await initTokenTable();
    const { encryptedTokens, iv, authTag } = encryptTokens(mergedTokens);

    const upsertSql = `
      INSERT INTO google_oauth_tokens (provider, encrypted_tokens, iv, auth_tag)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        encrypted_tokens = VALUES(encrypted_tokens),
        iv = VALUES(iv),
        auth_tag = VALUES(auth_tag),
        updated_at = CURRENT_TIMESTAMP
    `;

    try {
      await pool.query(upsertSql, ['google', encryptedTokens, iv, authTag]);
      return; // Successfully saved to database; never write to local disk in production
    } catch (dbErr) {
      console.error('[Google Auth] Error saving encrypted tokens to database:', dbErr.message);
      throw dbErr; // Propagate error so caller does not report false success
    }
  }

  // 2. Local development fallback (local environment only)
  try {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(mergedTokens, null, 2), 'utf8');
  } catch (err) {
    console.error('[Google Auth] Error saving local oauth.json token:', err.message);
    throw err;
  }
};

const clearTokens = async () => {
  // 1. Remove from database
  try {
    await initTokenTable();
    await pool.query('DELETE FROM google_oauth_tokens WHERE provider = ?', ['google']);
  } catch (dbErr) {
    console.error('[Google Auth] Error deleting tokens from database:', dbErr.message);
    if (isProduction) {
      throw dbErr;
    }
  }

  // 2. Remove local file fallback if present in development
  if (!isProduction) {
    try {
      if (fs.existsSync(TOKEN_PATH)) {
        fs.unlinkSync(TOKEN_PATH);
      }
    } catch (err) {
      console.error('[Google Auth] Error removing local oauth.json:', err.message);
    }
  }
};

const hasAuth = async () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    return false;
  }

  const tokens = await loadTokens();
  if (!tokens || typeof tokens !== 'object') {
    return false;
  }

  // Usable if a valid refresh_token exists to renew sessions
  if (tokens.refresh_token && typeof tokens.refresh_token === 'string' && tokens.refresh_token.trim() !== '') {
    return true;
  }

  // Or usable if an active access_token has a valid future expiration
  if (tokens.access_token && typeof tokens.access_token === 'string' && tokens.access_token.trim() !== '') {
    if (tokens.expiry_date && typeof tokens.expiry_date === 'number') {
      return tokens.expiry_date > Date.now();
    }
    return true;
  }

  return false;
};

const getOAuthClient = async (options = { loadTokens: true }) => {
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

  if (options && options.loadTokens) {
    const tokens = await loadTokens();
    if (tokens) {
      oauth2Client.setCredentials(tokens);
    }
  }

  // Automatically persist newly refreshed credentials without unhandled rejections
  oauth2Client.on('tokens', async (newTokens) => {
    try {
      await saveTokens(newTokens);
    } catch (err) {
      console.error('[Google Auth] Error persisting refreshed tokens:', err.message);
    }
  });

  return oauth2Client;
};

module.exports = {
  getOAuthClient,
  hasAuth,
  saveTokens,
  clearTokens,
  loadTokens,
  initTokenTable,
  getEncryptionKey,
  TOKEN_PATH
};
