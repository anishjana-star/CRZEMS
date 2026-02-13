import TimeEntry from '../models/TimeEntry.js';
import User from '../models/User.js';
import { getToday, getCurrentMonthYear, calculateHoursWorked } from '../utils/date.js';

/**
 * Record login time (clock in)
 * @param {string} employeeId - Employee ID
 * @returns {object} Created time entry
 */
const recordLoginTime = async (employeeId) => {
  const now = new Date();
  const today = getToday();
  const { month, year } = getCurrentMonthYear();

  // Check if already logged in today
  // Prevent more than one time entry per day (clock in only once per day)
  const existingEntry = await TimeEntry.findOne({
    employeeId,
    date: today
  });

  if (existingEntry) {
    throw new Error('Already logged in today');
  }

  const timeEntry = new TimeEntry({
    employeeId,
    date: today,
    loginTime: now,
    month,
    year
  });

  await safeCreateTimeEntry(timeEntry);
  return timeEntry;
};

// Handle potential duplicate key race (safety)
const safeCreateTimeEntry = async (entry) => {
  try {
    await entry.save();
    return entry;
  } catch (err) {
    // Mongo duplicate key error code
    if (err && err.code === 11000) {
      throw new Error('Already logged in today');
    }
    throw err;
  }
};

/**
 * Record logout time (clock out)
 * @param {string} employeeId - Employee ID
 * @returns {object} Updated time entry
 */
const recordLogoutTime = async (employeeId) => {
  const now = new Date();
  const today = getToday();

  const timeEntry = await TimeEntry.findOne({
    employeeId,
    date: today,
    logoutTime: null
  });

  if (!timeEntry) {
    throw new Error('No active login found');
  }

  const hoursWorked = calculateHoursWorked(timeEntry.loginTime, now);

  timeEntry.logoutTime = now;
  timeEntry.hoursWorked = hoursWorked;

  await timeEntry.save();
  return timeEntry;
};

/**
 * Get employee dashboard data
 * @param {string} employeeId - Employee ID
 * @returns {object} Dashboard data
 */
const getDashboardData = async (employeeId) => {
  const employee = await User.findById(employeeId);
  if (!employee) {
    throw new Error('Employee not found');
  }

  const { month, year } = getCurrentMonthYear();

  // Get time entries for current month
  const timeEntries = await TimeEntry.find({
    employeeId,
    month,
    year
  });

  // Calculate total hours worked this month
  const totalHours = timeEntries.reduce((sum, entry) => {
    return sum + (entry.hoursWorked || 0);
  }, 0);

  // Find today's entry (if any) to signal active clock-in state
  const today = getToday();
  const todaysEntry = await TimeEntry.findOne({ employeeId, date: today });

  return {
    employee: {
      name: employee.name,
      email: employee.email,
      salary: employee.salary,
      workHours: employee.workHours
    },
    monthlyStats: {
      totalHours: parseFloat(totalHours.toFixed(2)),
      daysWorked: timeEntries.length,
      currentMonth: month,
      currentYear: year
    }
    ,
    activeEntry: todaysEntry || null
  };
};

/**
 * Get time entries for employee
 * @param {string} employeeId - Employee ID
 * @param {number} month - Month (optional)
 * @param {number} year - Year (optional)
 * @returns {array} List of time entries
 */
const getTimeEntries = async (employeeId, month = null, year = null, startDate = null, endDate = null) => {
  const query = { employeeId };

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (month && year) {
    query.month = parseInt(month);
    query.year = parseInt(year);
  } else {
    const { month: currentMonth, year: currentYear } = getCurrentMonthYear();
    query.month = currentMonth;
    query.year = currentYear;
  }

  return await TimeEntry.find(query).sort({ date: 1 }); // Sort ascending for graph
};

export {
  recordLoginTime,
  recordLogoutTime,
  getDashboardData,
  getTimeEntries
};
