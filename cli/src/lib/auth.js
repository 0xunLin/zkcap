/**
 * Token storage — reads/writes credentials to ~/.zkcap/credentials.json
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import config from './config.js';

/**
 * Get the full path to the credentials file.
 */
function getCredentialsPath() {
  const dir = path.join(os.homedir(), config.credentialsDir);
  return {
    dir,
    file: path.join(dir, config.credentialsFile),
  };
}

/**
 * Save authentication credentials to disk.
 * @param {object} data — { token, github_username, github_avatar_url }
 */
export function saveCredentials(data) {
  const { dir, file } = getCredentialsPath();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * Load saved credentials from disk.
 * @returns {object|null} — the credentials object, or null if not found
 */
export function loadCredentials() {
  const { file } = getCredentialsPath();
  if (!fs.existsSync(file)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(file, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Delete saved credentials (logout).
 * @returns {boolean} — true if credentials existed and were deleted
 */
export function clearCredentials() {
  const { file } = getCredentialsPath();
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    return true;
  }
  return false;
}

/**
 * Get the saved zkCAP JWT token.
 * @returns {string|null}
 */
export function getToken() {
  const creds = loadCredentials();
  return creds?.token || null;
}
