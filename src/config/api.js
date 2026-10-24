/**
 * Centralized Application API Configuration
 *
 * Supports Create React App (REACT_APP_API_URL) as primary build configuration,
 * with fallback support for VITE_API_URL, production host defaults, and sanitation.
 */

const resolveApiUrl = () => {
  let envUrl = '';

  // 1. Check Create React App / standard process.env variables
  if (typeof process !== 'undefined' && process.env) {
    envUrl =
      process.env.REACT_APP_API_URL ||
      process.env.REACT_APP_BACKEND_URL ||
      process.env.VITE_API_URL ||
      '';
  }

  // 2. Check Vite build-time environment variables safely
  if (!envUrl) {
    try {
      if (typeof import.meta !== 'undefined' && import.meta && import.meta.env) {
        envUrl =
          import.meta.env.VITE_API_URL ||
          import.meta.env.REACT_APP_API_URL ||
          import.meta.env.VITE_BACKEND_URL ||
          '';
      }
    } catch (e) {
      // Ignored if import.meta is unavailable in bundler
    }
  }

  envUrl = String(envUrl || '').trim();

  // 3. Fallback for production builds / Vercel deployment when env variable is missing
  if (!envUrl) {
    const isProdEnv = typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'production';
    const isDeployedHost =
      typeof window !== 'undefined' &&
      (window.location.hostname.includes('vercel.app') ||
       window.location.hostname.includes('onrender.com') ||
       (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'));

    if (isProdEnv || isDeployedHost) {
      envUrl = 'https://campus-wellbeing.onrender.com';
    } else {
      envUrl = 'http://localhost:5000';
    }
  }

  // Normalize: Strip trailing slashes
  envUrl = envUrl.replace(/\/+$/, '');

  // Strip trailing '/api' to prevent duplicate '/api/api' in constructed URLs
  if (envUrl.endsWith('/api')) {
    envUrl = envUrl.slice(0, -4).replace(/\/+$/, '');
  }

  return envUrl;
};

export const API_URL = resolveApiUrl();
export const API_BASE = `${API_URL}/api`;

/**
 * Safely parse JSON from a fetch Response.
 * Protects against non-JSON (e.g. HTML 404/500/405/SPA fallback) error responses
 * from causing "Unexpected token '<', '<!DOCTYPE '... is not valid JSON".
 *
 * @param {Response} response
 * @param {string} defaultErrorMessage
 * @returns {Promise<any>}
 */
export const safeJson = async (response, defaultErrorMessage = 'Unexpected server response format.') => {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const statusText = response.statusText ? ` ${response.statusText}` : '';
    throw new Error(
      `API returned non-JSON response (${response.status}${statusText}). Please check backend connection at ${API_URL || 'configured backend'}.`
    );
  }
  try {
    return await response.json();
  } catch (err) {
    throw new Error(defaultErrorMessage);
  }
};

