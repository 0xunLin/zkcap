/**
 * zkcap login — Authenticate with GitHub using Device Flow.
 *
 * Flow:
 * 1. Request a device code from GitHub
 * 2. Show the user a code and open the browser to github.com/login/device
 * 3. Poll GitHub until the user approves
 * 4. Exchange the GitHub token with our backend for a zkCAP JWT
 * 5. Save credentials to ~/.zkcap/credentials.json
 */

import open from 'open';
import config from '../lib/config.js';
import { saveCredentials, loadCredentials } from '../lib/auth.js';
import { authWithGitHub } from '../lib/api.js';
import log from '../utils/logger.js';
import startSpinner from '../utils/spinner.js';

/**
 * Request a device code from GitHub.
 */
async function requestDeviceCode() {
  const resp = await fetch(config.github.deviceCodeUrl, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.github.clientId,
      scope: config.github.scopes,
    }),
  });

  if (!resp.ok) {
    throw new Error(`GitHub device code request failed: HTTP ${resp.status}`);
  }

  return resp.json();
}

/**
 * Poll GitHub for the access token after user authorizes.
 */
async function pollForToken(deviceCode, interval) {
  const pollInterval = (interval || 5) * 1000; // seconds → ms

  while (true) {
    await new Promise((r) => setTimeout(r, pollInterval));

    const resp = await fetch(config.github.accessTokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: config.github.clientId,
        device_code: deviceCode,
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      }),
    });

    const data = await resp.json();

    if (data.access_token) {
      return data.access_token;
    }

    if (data.error === 'authorization_pending') {
      // User hasn't approved yet, keep polling
      continue;
    }

    if (data.error === 'slow_down') {
      // GitHub wants us to slow down
      await new Promise((r) => setTimeout(r, 5000));
      continue;
    }

    if (data.error === 'expired_token') {
      throw new Error('Device code expired. Please run `zkcap login` again.');
    }

    if (data.error === 'access_denied') {
      throw new Error('Authorization was denied by the user.');
    }

    throw new Error(`Unexpected error: ${data.error || JSON.stringify(data)}`);
  }
}

/**
 * Main login handler.
 */
async function loginAction() {
  // Check if already logged in
  const existing = loadCredentials();
  if (existing?.token) {
    log.warn(`Already logged in as ${log.chalk.bold('@' + existing.github_username)}`);
    log.dim('Run `zkcap logout` first if you want to switch accounts.');
    return;
  }

  // Validate client ID is configured
  if (!config.github.clientId) {
    log.error('GitHub Client ID not configured.');
    log.dim('Set ZKCAP_GITHUB_CLIENT_ID environment variable or update cli/src/lib/config.js');
    process.exit(1);
  }

  let spinner;

  try {
    // Step 1: Get device code
    spinner = startSpinner('Requesting device code from GitHub...');
    const deviceData = await requestDeviceCode();
    spinner.stop();

    // Step 2: Show the code to the user
    console.log('');
    log.header('GitHub Authentication');
    log.kv('Your code', log.chalk.bold.cyan(deviceData.user_code));
    log.dim('');
    log.info(`Opening ${log.chalk.underline(deviceData.verification_uri)} in your browser...`);
    log.dim('If it doesn\'t open, go there manually and enter the code above.');
    console.log('');

    // Open browser
    await open(deviceData.verification_uri);

    // Step 3: Poll for approval
    spinner = startSpinner('Waiting for GitHub authorization...');
    const githubToken = await pollForToken(deviceData.device_code, deviceData.interval);
    spinner.succeed('GitHub authorized');

    // Step 4: Exchange with our backend
    spinner = startSpinner('Authenticating with zkCAP backend...');
    const authResult = await authWithGitHub(githubToken);
    spinner.succeed('Backend authenticated');

    // Step 5: Fetch user info to store username
    const userResp = await fetch(config.github.userUrl, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github+json',
      },
    });
    const ghUser = await userResp.json();

    // Save credentials
    saveCredentials({
      token: authResult.token,
      github_username: ghUser.login,
      github_avatar_url: ghUser.avatar_url || '',
    });

    console.log('');
    log.success(`Authenticated as ${log.chalk.bold('@' + ghUser.login)}`);
    log.dim('Credentials saved to ~/.zkcap/credentials.json');

  } catch (err) {
    if (spinner) spinner.fail('Authentication failed');
    log.error(err.message);
    process.exit(1);
  }
}

/**
 * Register the login command with commander.
 */
export function registerLogin(program) {
  program
    .command('login')
    .description('Authenticate with GitHub (Device Flow)')
    .action(loginAction);
}
