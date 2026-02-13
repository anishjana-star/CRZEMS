/**
 * Get today's date at midnight
 * @returns {Date} Today's date at 00:00:00
 */
export const getToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

/**
 * Get current month and year
 * @returns {object} Object with month and year
 */
export const getCurrentMonthYear = () => {
  const now = new Date();
  return {
    month: now.getMonth() + 1,
    year: now.getFullYear()
  };
};

/**
 * Calculate hours worked between two dates
 * @param {Date} startTime - Start time
 * @param {Date} endTime - End time
 * @returns {number} Hours worked (rounded to 2 decimals)
 */
export const calculateHoursWorked = (startTime, endTime) => {
  const hours = (endTime - startTime) / (1000 * 60 * 60);
  return parseFloat(hours.toFixed(2));
};
