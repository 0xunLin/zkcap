/**
 * zkcap onchain <commit-hash> — Anchor an attestation on-chain.
 *
 * Looks up the attestation for the given commit and submits it
 * for on-chain anchoring. Currently a placeholder that updates status.
 *
 * Usage:
 *   zkcap onchain <commit-hash> --repo <owner/repo>
 */

import { loadCredentials } from '../lib/auth.js';
import { listAttestations, submitOnchain } from '../lib/api.js';
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

async function onchainAction(commitHash) {
  requireAuth();

  // Find the attestation for this commit
  let spinner = startSpinner('Looking up attestation...');
  let attestation;

  try {
    const attestations = await listAttestations();
    attestation = attestations.find(
      (a) => a.commit_hash.startsWith(commitHash)
    );

    if (!attestation) {
      spinner.fail('Attestation not found');
      log.error(`No attestation found for commit ${commitHash}`);
      log.dim('Run `zkcap attest <hash>` first to create one.');
      process.exit(1);
    }

    spinner.succeed(`Found attestation for ${log.chalk.cyan(attestation.commit_hash.substring(0, 8))}`);
  } catch (err) {
    spinner.fail('Lookup failed');
    log.error(err.message);
    process.exit(1);
  }

  if (attestation.status === 'onchain') {
    log.warn('This attestation is already on-chain.');
    log.kv('Transaction', attestation.onchain_tx);
    return;
  }

  // Submit on-chain
  spinner = startSpinner('Submitting attestation to chain...');
  try {
    const result = await submitOnchain(attestation.id);
    spinner.succeed('Attestation anchored on-chain');

    console.log('');
    log.kv('Status     ', log.chalk.bold.green(result.status.toUpperCase()));
    log.kv('Transaction', log.chalk.cyan(result.onchain_tx));
    console.log('');
  } catch (err) {
    spinner.fail('On-chain submission failed');
    log.error(err.message);
    process.exit(1);
  }
}

/**
 * Register the onchain command with commander.
 */
export function registerOnchain(program) {
  program
    .command('onchain <commit-hash>')
    .description('Anchor an attestation on-chain (optional)')
    .action(onchainAction);
}
