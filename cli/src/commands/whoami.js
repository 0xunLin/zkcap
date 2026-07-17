/**
 * zkcap whoami — Show the current authenticated user.
 */

import { loadCredentials } from '../lib/auth.js';
import { getMe } from '../lib/api.js';
import log from '../utils/logger.js';
import startSpinner from '../utils/spinner.js';

async function whoamiAction() {
  const creds = loadCredentials();
  if (!creds?.token) {
    log.warn('Not logged in. Run `zkcap login` first.');
    process.exit(1);
  }

  let spinner;
  try {
    spinner = startSpinner('Checking session...');
    const user = await getMe();
    spinner.stop();

    console.log('');
    log.header('Current User');
    log.kv('Username ', log.chalk.bold('@' + user.github_username));
    log.kv('GitHub ID', String(user.github_id));
    if (user.github_avatar_url) {
      log.kv('Avatar   ', user.github_avatar_url);
    }
    log.kv('User ID  ', user.id);
    console.log('');
  } catch (err) {
    if (spinner) spinner.fail('Session check failed');
    if (err.message.includes('expired') || err.message.includes('Invalid') || err.message.includes('401')) {
      log.error('Session expired. Run `zkcap login` to re-authenticate.');
    } else {
      log.error(err.message);
    }
    process.exit(1);
  }
}

/**
 * Register the whoami command with commander.
 */
export function registerWhoami(program) {
  program
    .command('whoami')
    .description('Show the current authenticated GitHub user')
    .action(whoamiAction);
}
