import crypto from 'crypto';

/**
 * Generate random password for new employees
 * @param {number} length - Password length (default: 8)
 * @returns {string} Random password
 */
export const generateRandomPassword = (length = 8) => {
  return crypto.randomBytes(length).toString('hex');
};
