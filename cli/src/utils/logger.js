/**
 * Colored output helpers using chalk.
 */

import chalk from 'chalk';

export const log = {
  /** Success message — green checkmark */
  success: (msg) => console.log(chalk.green('✓') + ' ' + msg),

  /** Error message — red cross */
  error: (msg) => console.log(chalk.red('✗') + ' ' + chalk.red(msg)),

  /** Warning message — yellow */
  warn: (msg) => console.log(chalk.yellow('⚠') + ' ' + chalk.yellow(msg)),

  /** Info message — cyan */
  info: (msg) => console.log(chalk.cyan('ℹ') + ' ' + msg),

  /** Dim/muted text */
  dim: (msg) => console.log(chalk.dim(msg)),

  /** Bold text */
  bold: (msg) => console.log(chalk.bold(msg)),

  /** Key-value pair */
  kv: (key, value) => console.log(chalk.gray(key + ':') + ' ' + chalk.white(value)),

  /** Section header */
  header: (msg) => {
    console.log('');
    console.log(chalk.bold.underline(msg));
    console.log('');
  },

  /** Raw chalk instance for custom formatting */
  chalk,
};

export default log;
