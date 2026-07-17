/**
 * zkcap attest <commit-hash> — Attest a commit.
 *
 * Fetches commit metadata from GitHub by SHA, sends it to the backend,
 * which computes a SHA-256 attestation hash and stores it.
 *
 * Usage:
 *   zkcap attest <commit-hash> --repo <owner/repo>
 */

import { loadCredentials } from '../lib/auth.js';
import { fetchCommitMetadata } from '../lib/github.js';
import { createAttestation, listProjects } from '../lib/api.js';
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

async function attestAction(commitHash, options) {
  requireAuth();

  let repoSlug = options.repo;

  // If repo not provided, try to auto-detect from linked repos
  if (!repoSlug) {
    const spinner = startSpinner('Detecting repository...');
    try {
      const projects = await listProjects();
      if (projects.length === 0) {
        spinner.fail('No repositories linked');
        log.error('Link a repo first: zkcap repo add <owner/repo>');
        process.exit(1);
      } else if (projects.length === 1) {
        repoSlug = projects[0].github_repo;
        spinner.succeed(`Using repository ${log.chalk.bold(repoSlug)}`);
      } else {
        spinner.fail('Multiple repos linked');
        log.error('Specify which repo with --repo <owner/repo>');
        log.dim('Linked repos:');
        projects.forEach((p) => log.dim(`  - ${p.github_repo}`));
        process.exit(1);
      }
    } catch (err) {
      spinner.fail('Failed to detect repository');
      log.error(err.message);
      process.exit(1);
    }
  }

  const [owner, repo] = repoSlug.split('/');
  if (!owner || !repo) {
    log.error('Invalid repo format. Use: owner/repo');
    process.exit(1);
  }

  // Fetch commit metadata from GitHub
  let spinner = startSpinner(`Fetching commit ${commitHash.substring(0, 8)}... from GitHub`);
  let metadata;
  try {
    metadata = await fetchCommitMetadata(owner, repo, commitHash);
    spinner.succeed('Commit metadata fetched');
  } catch (err) {
    spinner.fail('Failed to fetch commit');
    log.error(err.message);
    process.exit(1);
  }

  // Display commit info
  const msgFirstLine = metadata.message.split('\n')[0];
  console.log('');
  log.kv('Commit ', log.chalk.cyan(metadata.commit_hash.substring(0, 8)));
  log.kv('Message', msgFirstLine);
  log.kv('Author ', metadata.author);
  log.kv('Date   ', metadata.timestamp);
  if (metadata.additions !== null) {
    log.kv('Stats  ', log.chalk.green(`+${metadata.additions}`) + ' / ' + log.chalk.red(`-${metadata.deletions}`) + ` / ${metadata.files_changed} files`);
  }
  console.log('');

  // Send to backend for attestation
  spinner = startSpinner('Generating attestation hash...');
  try {
    const result = await createAttestation({
      github_repo: repoSlug,
      commit_hash: metadata.commit_hash,
      message: metadata.message,
      author: metadata.author,
      timestamp: metadata.timestamp,
      tree_hash: metadata.tree_hash,
      parent_hashes: metadata.parent_hashes,
      additions: metadata.additions,
      deletions: metadata.deletions,
      files_changed: metadata.files_changed,
    });
    spinner.succeed('Attestation created');

    console.log('');
    log.kv('Attestation Hash', log.chalk.bold.green(result.attestation_hash));
    log.kv('Status          ', log.chalk.cyan(result.status.toUpperCase()));
    log.kv('Attestation ID  ', result.id);
    console.log('');
    log.dim('To anchor on-chain: zkcap onchain ' + metadata.commit_hash.substring(0, 8));
  } catch (err) {
    spinner.fail('Attestation failed');
    log.error(err.message);
    process.exit(1);
  }
}

/**
 * Register the attest command with commander.
 */
export function registerAttest(program) {
  program
    .command('attest <commit-hash>')
    .description('Create a verifiable attestation for a commit')
    .option('-r, --repo <owner/repo>', 'GitHub repository (auto-detected if only one is linked)')
    .action(attestAction);
}
