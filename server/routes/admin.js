import express from 'express';
import { auth, isAdmin } from '../middleware/auth.js';
import {
  createEmployee,
  getAllEmployees,
  updateEmployeeSalary,
  updateEmployeeWorkHours,
  assignTask,
  getAllTasks,
  getEmployeeTimeEntries,
  changeUserPassword,
  getAllLeaves,
  decideLeave,
  createMeeting,
  getAllMeetings,
  terminateEmployee,
  promoteEmployee,
  getAttendanceStats,
  paySalary,
  getPayrollStatus,
  getEmployeePayrollHistory,
  getEmployeeById
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require admin authentication
router.use(auth);
router.use(isAdmin);

// Employee routes
router.post('/employees', createEmployee);
router.get('/employees', getAllEmployees);
router.get('/employees/:id', getEmployeeById);
router.put('/employees/:id/salary', updateEmployeeSalary);
router.put('/employees/:id/work-hours', updateEmployeeWorkHours);
router.get('/employees/:id/time-entries', getEmployeeTimeEntries);
router.put('/employees/:id/password', changeUserPassword); // Admin can change employee password
router.put('/employees/:id/terminate', terminateEmployee);
router.put('/employees/:id/promote', promoteEmployee);

// Task routes
router.post('/tasks', assignTask);
router.get('/tasks', getAllTasks);

// Leave routes
router.get('/leaves', getAllLeaves);
router.put('/leaves/:id/decide', decideLeave);

// Meeting routes
router.post('/meetings', createMeeting);
router.get('/meetings', getAllMeetings);

// Stats route
router.get('/stats', getAttendanceStats);

// Payroll Routes
router.post('/payroll/pay', paySalary);
router.get('/payroll/status', getPayrollStatus);
router.get('/payroll/history/:employeeId', getEmployeePayrollHistory);

export default router;