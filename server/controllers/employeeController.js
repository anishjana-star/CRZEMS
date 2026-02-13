import * as timeEntryService from '../services/timeEntryService.js';
import * as taskService from '../services/taskService.js'; // Corrected the import statement
import * as leaveService from '../services/leaveService.js';
import * as meetingService from '../services/meetingService.js';

/**
 * Record login time (clock in)
 */
const recordLoginTime = async (req, res) => {
  try {
    const timeEntry = await timeEntryService.recordLoginTime(req.user._id);
    res.status(201).json({
      message: 'Login time recorded',
      timeEntry
    });
  } catch (error) {
    if (error.message === 'Already logged in today') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Login time error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Record logout time (clock out)
 */
const recordLogoutTime = async (req, res) => {
  try {
    const timeEntry = await timeEntryService.recordLogoutTime(req.user._id);
    res.json({
      message: 'Logout time recorded',
      timeEntry
    });
  } catch (error) {
    if (error.message === 'No active login found') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Logout time error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get employee dashboard data
 */
const getDashboard = async (req, res) => {
  try {
    const dashboardData = await timeEntryService.getDashboardData(req.user._id);
    const tasks = await taskService.getEmployeeTasks(req.user._id);

    res.json({
      ...dashboardData,
      tasks: tasks.slice(0, 10) // Latest 10 tasks
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all tasks assigned to employee
 */
const getTasks = async (req, res) => {
  try {
    const tasks = await taskService.getEmployeeTasks(req.user._id);
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update task status
 */
const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await taskService.updateTaskStatus(req.params.id, req.user._id, status);
    res.json({
      message: 'Task status updated',
      task
    });
  } catch (error) {
    if (error.message === 'Invalid status' || error.message === 'Task not found') {
      return res.status(error.message === 'Task not found' ? 404 : 400).json({ message: error.message });
    }
    console.error('Update task status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get monthly time entries
 */
const getTimeEntries = async (req, res) => {
  try {
    const { month, year, startDate, endDate } = req.query;
    const timeEntries = await timeEntryService.getTimeEntries(req.user._id, month, year, startDate, endDate);
    res.json(timeEntries);
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Apply for leave
 */
const applyLeave = async (req, res) => {
  try {
    const leave = await leaveService.applyLeave(req.user._id, req.body);
    res.status(201).json({ message: 'Leave applied', leave });
  } catch (error) {
    if (error.message === 'Start and end dates are required' || error.message === 'Employee not found') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Apply leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get leaves for current employee
 */
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await leaveService.getEmployeeLeaves(req.user._id);
    res.json(leaves);
  } catch (error) {
    console.error('Get my leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * 👈 NEW: Get salary data for current employee
 */
// Import Payroll model
import Payroll from '../models/Payroll.js';
import User from '../models/User.js';

/**
 * 👈 NEW: Get salary data for current employee
 */
const getSalaryData = async (req, res) => {
  try {
    const employeeId = req.user._id;
    const user = await User.findById(employeeId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 1. Fetch Payroll History (Payslips)
    const payrolls = await Payroll.find({ employee: employeeId }).sort({ year: -1, month: -1 });

    const payslips = payrolls.map(p => {
      const monthName = new Date(0, p.month - 1).toLocaleString('default', { month: 'long' }).toUpperCase();
      return {
        _id: p._id,
        name: `${user.name} ${monthName} ${p.year} PAYSLIP`,
        month: new Date(p.year, p.month - 1),
        // Direct link to the print view
        fileUrl: `/employee/salary/print/${p.month}/${p.year}`
      };
    });

    // 2. Format Promotions
    const promotions = user.promotionHistory.map((promo, index) => ({
      _id: promo._id || index,
      title: `Promoted to ${promo.designation}`,
      date: promo.date,
      newSalary: user.salary, // Current salary (history not stored in simple model, using current)
      position: promo.designation,
      reason: 'Performance Review' // Placeholder as reason isn't in model
    })).reverse();

    // 3. Termination Details
    let termination = null;
    if (user.status === 'terminated') {
      termination = {
        reason: user.terminationReason,
        date: new Date() // You might want to store terminationDate in model if not present, using current date as fallback or if stored
      };
    }

    // 4. Current Salary Info
    const currentSalary = {
      amount: user.salary,
      position: user.designation,
      effectiveDate: user.createdAt // Using join date as effective date fallback
    };

    const salaryData = {
      currentSalary,
      payslips,
      promotions,
      termination
    };

    res.json(salaryData);
  } catch (error) {
    console.error('Get salary data error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get specific payslip data
 */
const getPayslip = async (req, res) => {
  try {
    const { year, month } = req.params;
    const employeeId = req.user._id;

    const payroll = await Payroll.findOne({
      employee: employeeId,
      year: parseInt(year),
      month: parseInt(month)
    });

    if (!payroll) {
      return res.status(404).json({ message: 'Payslip not found' });
    }

    const user = await User.findById(employeeId);

    res.json({
      payroll,
      employee: user
    });
  } catch (error) {
    console.error('Get payslip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createMeetingForUser = async (req, res) => {
  try {
    const meeting = await meetingService.createMeeting(req.body, req.user._id);
    res.status(201).json({ message: 'Meeting created', meeting });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyMeetings = async (req, res) => {
  try {
    const meetings = await meetingService.getMeetingsForUser(req.user._id);
    res.json(meetings);
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllEmployeesForUser = async (req, res) => {
  try {
    const employees = await (await import('../services/employeeService.js')).getAllEmployees();
    res.json(employees);
  } catch (error) {
    console.error('Get employees for user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  recordLoginTime,
  recordLogoutTime,
  getDashboard,
  getTasks,
  updateTaskStatus,
  getTimeEntries,
  applyLeave,
  getMyLeaves,
  getMyMeetings,
  createMeetingForUser,
  getAllEmployeesForUser,
  getSalaryData,
  getPayslip // 👈 NEW: Added to exports
};
