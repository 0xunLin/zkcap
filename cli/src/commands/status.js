/**
 * zkcap status — View attestation statuses across all linked repos.
 *
 * Displays a table of commits and their attestation states.
 */

import { loadCredentials } from '../lib/auth.js';
import { listAttestations, listProjects } from '../lib/api.js';
import log from '../utils/logger.js';
import startSpinner from '../utils/spinner.js';

function requireAuth() {
  const creds = loadCredentials();
  if (!creds?.token) {
    log.error('Not logged in. Run `zkcap login` first.');
    process.exit(1);
  }
  return creds;
}

/**
 * Format status with color.
 */
function formatStatus(status) {
  switch (status) {
    case 'generated':
      return log.chalk.green('GENERATED');
    case 'onchain':
      return log.chalk.bold.cyan('ON-CHAIN');
    case 'pending':
      return log.chalk.yellow('PENDING');
    case 'failed':
      return log.chalk.red('FAILED');
    default:
      return log.chalk.gray(status.toUpperCase());
  }
}

async function statusAction() {
  requireAuth();

  const spinner = startSpinner('Fetching attestation status...');

  try {
    const [attestations, projects] = await Promise.all([
      listAttestations(),
      listProjects(),
    ]);
    spinner.stop();

    if (projects.length === 0) {
      log.warn('No repositories linked yet.');
      log.dim('Run `zkcap repo add <owner/repo>` to link one.');
      return;
    }

    if (attestations.length === 0) {
      log.warn('No attestations found.');
      log.dim('Run `zkcap attest <commit-hash>` to create one.');
      return;
    }

    log.header('Attestation Status');

    // Table header
    const hashW = 10;
    const statusW = 12;
    const msgW = 45;

    const headerLine =
      log.chalk.dim(
        'HASH'.padEnd(hashW) +
        'STATUS'.padEnd(statusW) +
        'MESSAGE'
      );
    console.log(headerLine);
    console.log(log.chalk.dim('─'.repeat(hashW + statusW + msgW)));

    // Table rows
    attestations.forEach((a) => {
      const hash = log.chalk.cyan(a.commit_hash.substring(0, 8));
      const stat = formatStatus(a.status);
      const msg = a.message.split('\n')[0].substring(0, msgW);

      console.log(
        `${hash.padEnd(hashW + 10)}` +  // +10 to account for chalk escape codes
        `${stat.padEnd(statusW + 10)}` +
        `${msg}`
      );
    });

    console.log('');
    log.dim(`Total: ${attestations.length} attestation(s)`);
    console.log('');

  } catch (err) {
    spinner.fail('Failed to fetch status');
    log.error(err.message);
    process.exit(1);
  }
}

/**
 * Register the status command with commander.
 */
export function registerStatus(program) {
  program
    .command('status')
    .description('View attestation statuses for all linked repos')
    .action(statusAction);
}
