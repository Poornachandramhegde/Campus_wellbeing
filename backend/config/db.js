const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Determine database connection credentials (supports individual vars or DATABASE_URL/DB_URI)
let host = process.env.DB_HOST || 'localhost';
let port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;
let user = process.env.DB_USER || 'root';
let password = process.env.DB_PASSWORD || '';
let database = process.env.DB_NAME || 'erp_wellbeing';

const dbUri = process.env.DATABASE_URL || process.env.DB_URI;
if (dbUri) {
  try {
    const parsed = new URL(dbUri);
    if (parsed.hostname) host = parsed.hostname;
    if (parsed.port) port = parseInt(parsed.port, 10);
    if (parsed.username) user = decodeURIComponent(parsed.username);
    if (parsed.password) password = decodeURIComponent(parsed.password);
    if (parsed.pathname && parsed.pathname.length > 1) {
      database = decodeURIComponent(parsed.pathname.slice(1));
    }
  } catch (err) {
    console.warn('[Database Config] Failed to parse DATABASE_URL / DB_URI. Falling back to individual DB_* environment variables.');
  }
}

// Configure SSL for production cloud databases (such as Aiven MySQL) while preserving non-SSL local development
let sslConfig = null;

const sslExplicitlyDisabled =
  process.env.DB_SSL === 'false' ||
  process.env.DB_SSL === '0' ||
  process.env.DB_SSL_MODE === 'DISABLED';

const sslRequested =
  process.env.DB_SSL === 'true' ||
  process.env.DB_SSL === '1' ||
  process.env.DB_SSL === 'REQUIRED' ||
  process.env.DB_SSL_MODE === 'REQUIRED' ||
  process.env.DB_SSL_MODE === 'VERIFY_CA' ||
  process.env.DB_SSL_MODE === 'VERIFY_IDENTITY' ||
  Boolean(process.env.DB_SSL_CA) ||
  Boolean(process.env.DB_SSL_CA_PATH) ||
  (dbUri && dbUri.includes('ssl-mode=REQUIRED'));

if (sslRequested && !sslExplicitlyDisabled) {
  sslConfig = {
    // Default rejectUnauthorized to true, unless explicitly set to 'false'
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== 'false'
  };

  if (process.env.DB_SSL_CA) {
    // Supports raw PEM certificate string passed directly in environment variable
    sslConfig.ca = process.env.DB_SSL_CA.replace(/\\n/g, '\n');
  } else if (process.env.DB_SSL_CA_PATH) {
    // Supports path to downloaded ca.pem file
    const caFilePath = path.resolve(process.env.DB_SSL_CA_PATH);
    if (fs.existsSync(caFilePath)) {
      sslConfig.ca = fs.readFileSync(caFilePath, 'utf8');
    } else {
      console.warn(`[Database Config Warning] DB_SSL_CA_PATH specified (${caFilePath}) but file does not exist.`);
    }
  }
}

const poolConfig = {
  host,
  port,
  user,
  password,
  database,
  waitForConnections: true,
  connectionLimit: process.env.DB_CONNECTION_LIMIT ? parseInt(process.env.DB_CONNECTION_LIMIT, 10) : 10,
  queueLimit: 0,
  ...(sslConfig ? { ssl: sslConfig } : {})
};

const pool = mysql.createPool(poolConfig);

module.exports = pool;

