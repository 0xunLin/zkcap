/**
 * zkcap repo — Link and list GitHub repositories.
 *
 * Subcommands:
 *   zkcap repo add <owner/repo>   Link a repository
 *   zkcap repo list               List linked repositories
 */

import { loadCredentials } from '../lib/auth.js';
import { addProject, listProjects } from '../lib/api.js';
import log from '../utils/logger.js';
import startSpinner from '../utils/spinner.js';

/**
 * Ensure user is logged in.
 */
function requireAuth() {
  const creds = loadCredentials();
  if (!creds?.token) {
    log.error('Not logged in. Run `zkcap login` first.');
    process.exit(1);
  }
  return creds;
}

/**
 * zkcap repo add <owner/repo>
 */
async function repoAddAction(repoSlug) {
  requireAuth();

  // Validate format
  if (!repoSlug || !repoSlug.includes('/')) {
    log.error('Invalid format. Use: zkcap repo add <owner/repo>');
    log.dim('Example: zkcap repo add sprem/my-private-repo');
    process.exit(1);
  }

  const spinner = startSpinner(`Linking repository ${repoSlug}...`);

  try {
    const project = await addProject(repoSlug);
    spinner.succeed(`Repository ${log.chalk.bold(repoSlug)} linked`);
    log.dim(`Project ID: ${project.id}`);
  } catch (err) {
    spinner.fail('Failed to link repository');
    log.error(err.message);
    process.exit(1);
  }
}

/**
 * zkcap repo list
 */
async function repoListAction() {
  requireAuth();

  const spinner = startSpinner('Fetching linked repositories...');

  try {
    const projects = await listProjects();
    spinner.stop();

    if (projects.length === 0) {
      log.warn('No repositories linked yet.');
      log.dim('Run `zkcap repo add <owner/repo>` to link one.');
      return;
    }

    log.header('Linked Repositories');

    projects.forEach((p, i) => {
      const num = log.chalk.dim(`${i + 1}.`);
      const name = log.chalk.bold(p.github_repo);
      const commits = log.chalk.cyan(`${p.commit_count} commits`);
      console.log(`  ${num} ${name}  (${commits})`);
    });
    console.log('');
  } catch (err) {
    spinner.fail('Failed to fetch repositories');
    log.error(err.message);
    process.exit(1);
  }
}

/**
 * Register the repo command with commander.
 */
export function registerRepo(program) {
  const repo = program
    .command('repo')
    .description('Manage linked GitHub repositories');

  repo
    .command('add <owner/repo>')
    .description('Link a GitHub repository to track')
    .action(repoAddAction);

  repo
    .command('list')
    .description('List all linked repositories')
    .action(repoListAction);
}
