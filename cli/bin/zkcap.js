#!/usr/bin/env node

/**
 * zkcap — CLI for the Zero-Knowledge Commit Attestation Protocol.
 *
 * Usage:
 *   zkcap login          Authenticate with GitHub
 *   zkcap logout         Clear stored credentials
 *   zkcap whoami         Show current authenticated user
 *   zkcap repo add       Link a GitHub repository
 *   zkcap repo list      List linked repositories
 *   zkcap attest <hash>  Attest a commit by SHA
 *   zkcap onchain <hash> Anchor attestation on-chain
 *   zkcap status         View attestation statuses
 */

import { program } from 'commander';
import { registerLogin } from '../src/commands/login.js';
import { registerLogout } from '../src/commands/logout.js';
import { registerWhoami } from '../src/commands/whoami.js';
import { registerRepo } from '../src/commands/repo.js';
import { registerAttest } from '../src/commands/attest.js';
import { registerOnchain } from '../src/commands/onchain.js';
import { registerStatus } from '../src/commands/status.js';

program
  .name('zkcap')
  .description('Zero-Knowledge Commit Attestation Protocol — CLI')
  .version('0.1.0');

// Register all commands
registerLogin(program);
registerLogout(program);
registerWhoami(program);
registerRepo(program);
registerAttest(program);
registerOnchain(program);
registerStatus(program);

program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
