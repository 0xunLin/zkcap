/**
 * zkcap logout — Clear stored credentials.
 */

import { clearCredentials } from '../lib/auth.js';
import log from '../utils/logger.js';

async function logoutAction() {
  const cleared = clearCredentials();
  if (cleared) {
    log.success('Logged out. Credentials removed from ~/.zkcap/credentials.json');
  } else {
    log.warn('No credentials found. You are not logged in.');
  }
}

/**
 * Register the logout command with commander.
 */
export function registerLogout(program) {
  program
    .command('logout')
    .description('Clear stored GitHub credentials')
    .action(logoutAction);
}
