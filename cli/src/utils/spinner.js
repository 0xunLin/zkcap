/**
 * Ora spinner wrapper for consistent loading indicators.
 */

import ora from 'ora';

/**
 * Create and start a spinner with the given message.
 * @param {string} text — spinner message
 * @returns {object} — ora spinner instance
 */
export function startSpinner(text) {
  return ora({ text, color: 'cyan' }).start();
}

export default startSpinner;
