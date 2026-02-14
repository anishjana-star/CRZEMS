import path from 'path';
import fs from 'fs';
import PDFDocument from 'pdfkit';
import { sendEmail } from '../utils/email.js';
import * as employeeService from '../services/employeeService.js';
import * as taskService from '../services/taskService.js';
import * as timeEntryService from '../services/timeEntryService.js';
import * as leaveService from '../services/leaveService.js';
import * as meetingService from '../services/meetingService.js';
import Holiday from '../models/Holiday.js';
import TimeEntry from '../models/TimeEntry.js';
import User from '../models/User.js';
import Payroll from '../models/Payroll.js';

/**
 * Create a new employee
 */
const createEmployee = async (req, res) => {
  try {
    const employee = await employeeService.createEmployee(req.body);

    // Send Welcome Email
    try {
      const dashboardUrl = 'http://localhost:3000'; // Or process.env.CLIENT_URL
      const subject = 'Welcome to Our Team! - Login Credentials';
      const text = `Dear ${employee.name},\n\nCongratulations and welcome to the team! We are thrilled to have you join us at CRZ ACADEMIC REVIEW PVT LTD.\n\nTo get you started, here are your login credentials for the employee portal:\n\nDashboard URL: ${dashboardUrl}\n\nUser ID (Email): ${employee.email}\n\nTemporary Password: ${employee.password}\n\n⚠️ For security reasons, we highly recommend that you change your password immediately after your first login.\n\nIf you have any questions or need assistance, please feel free to reach out to the HR department or your manager.\n\nWe look forward to working with you!\n\nBest regards,\nCRZ Management Team`;

      const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
                .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                .header { background-color: #0d47a1; color: white; padding: 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
                .header .emoji { font-size: 30px; margin-top: 10px; display: block; }
                .content { padding: 30px; background-color: #fff; }
                .credentials-box { background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .credential-row { margin-bottom: 10px; font-size: 14px; }
                .credential-row:last-child { margin-bottom: 0; }
                .label { font-weight: bold; color: #333; width: 150px; display: inline-block; }
                .value { color: #0d47a1; }
                .password-value { background-color: #e0e0e0; padding: 2px 6px; border-radius: 4px; color: #333; font-family: monospace; }
                .warning { color: #d32f2f; font-size: 13px; margin-top: 20px; line-height: 1.4; }
                .footer { margin-top: 30px; font-size: 14px; color: #333; }
                a { color: #1976d2; text-decoration: underline; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome CRZ ACADEMIC REVIEW PVT LTD!</h1>
                    <span class="emoji">🚀</span>
                </div>
                <div class="content">
                    <p>Dear ${employee.name},</p>
                    <p style="margin-bottom: 15px;">Congratulations and welcome to the team! We are thrilled to have you join us at <strong>CRZ ACADEMIC REVIEW PVT LTD</strong>.</p>
                    <p>To get you started, here are your login credentials for the employee portal:</p>
                    
                    <div class="credentials-box">
                        <div class="credential-row">
                            <span class="label">Dashboard URL:</span> 
                            <span class="value"><a href="${dashboardUrl}">${dashboardUrl}</a></span>
                        </div>
                        <div class="credential-row">
                            <span class="label">User ID (Email):</span> 
                            <span class="value"><a href="mailto:${employee.email}">${employee.email}</a></span>
                        </div>
                        <div class="credential-row">
                            <span class="label">Temporary Password:</span> 
                            <span class="password-value">${employee.password}</span>
                        </div>
                    </div>

                    <p style="font-size: 14px; margin-top: 20px;">You can change your password on your EMS Portal.</p>

                    <div class="warning">
                        ⚠️ <strong>For security reasons, we highly recommend that you change your password immediately after your first login.</strong>
                    </div>
                    
                    <p style="font-size: 14px; margin-top: 15px; color: #555;">If you have any questions or need assistance, please feel free to reach out to the HR department or your manager.</p>
                    
                    <p style="font-size: 14px; color: #555;">We look forward to working with you!</p>
                    
                    <div class="footer">
                        Best regards,<br>
                        CRZ Management Team
                    </div>
                </div>
            </div>
        </body>
        </html>
      `;

      await sendEmail({
        to: employee.email,
        subject,
        text,
        html
      });
      console.log(`Welcome email sent to ${employee.email}`);
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
      // Not failing the response as employee is created
    }

    res.status(201).json({
      message: 'Employee created successfully',
      employee
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    if (error.message === 'Name and email are required') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Create employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all employees
 */
const getAllEmployees = async (req, res) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get employee by ID
 */
const getEmployeeById = async (req, res) => {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.json(employee);
  } catch (error) {
    console.error('Get employee by ID error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update employee salary
 */
const updateEmployeeSalary = async (req, res) => {
  try {
    const { salary } = req.body;
    const employee = await employeeService.updateEmployeeSalary(req.params.id, salary);
    res.json({
      message: 'Salary updated successfully',
      employee
    });
  } catch (error) {
    if (error.message === 'Valid salary is required' || error.message === 'Employee not found') {
      return res.status(error.message === 'Employee not found' ? 404 : 400).json({ message: error.message });
    }
    console.error('Update salary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update employee work hours
 */
const updateEmployeeWorkHours = async (req, res) => {
  try {
    const { workHours } = req.body;
    const employee = await employeeService.updateEmployeeWorkHours(req.params.id, workHours);
    res.json({
      message: 'Work hours updated successfully',
      employee
    });
  } catch (error) {
    if (error.message === 'Valid work hours is required' || error.message === 'Employee not found') {
      return res.status(error.message === 'Employee not found' ? 404 : 400).json({ message: error.message });
    }
    console.error('Update work hours error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Assign task to employee
 */
const assignTask = async (req, res) => {
  try {
    const { title, description, assignedTo, dueDate, role } = req.body;

    if (!title || !assignedTo || (Array.isArray(assignedTo) && assignedTo.length === 0)) {
      return res.status(400).json({ message: 'Title and at least one employee are required' });
    }

    const employeeIds = Array.isArray(assignedTo) ? assignedTo : [assignedTo];
    const tasks = [];

    // Iterate through each employee ID and create a task
    for (const employeeId of employeeIds) {
      try {
        const task = await taskService.createTask({
          title,
          description,
          assignedTo: employeeId,
          dueDate,
          role
        }, req.user._id);
        tasks.push(task);
      } catch (error) {
        console.error(`Failed to assign task to employee ${employeeId}:`, error);
        // Continue assigning to other employees even if one fails
        // Optionally, could collect errors to return to the client
      }
    }

    if (tasks.length === 0 && employeeIds.length > 0) {
      return res.status(400).json({ message: 'Failed to assign task to any employee. Check employee IDs.' });
    }

    res.status(201).json({
      message: `Task assigned successfully to ${tasks.length} employee(s)`,
      tasks
    });
  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all tasks
 */
const getAllTasks = async (req, res) => {
  try {
    const tasks = await taskService.getAllTasks();
    res.json(tasks);
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get employee time entries
 */
const getEmployeeTimeEntries = async (req, res) => {
  try {
    const { month, year } = req.query;
    const timeEntries = await timeEntryService.getTimeEntries(req.params.id, month, year);
    res.json(timeEntries);
  } catch (error) {
    console.error('Get time entries error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Admin: change a user's password
 */
const changeUserPassword = async (req, res) => {
  try {
    // Restrict admin password change to self only
    if (req.params.id !== String(req.user._id)) {
      return res.status(403).json({ message: 'Admins may only change their own password' });
    }

    const { password } = req.body;
    if (!password) return res.status(400).json({ message: 'Password is required' });

    const result = await employeeService.changePassword(req.params.id, password);
    res.json({ message: 'Password changed', user: result });
  } catch (error) {
    if (error.message === 'User not found' || error.message.startsWith('Password')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all leave requests
 */
const getAllLeaves = async (req, res) => {
  try {
    const leaves = await leaveService.getAllLeaves();
    res.json(leaves);
  } catch (error) {
    console.error('Get leaves error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Approve or decline a leave
 */
const decideLeave = async (req, res) => {
  try {
    const { status } = req.body;
    const leave = await leaveService.decideLeave(req.params.id, req.user._id, status);
    res.json({ message: `Leave ${status}`, leave });
  } catch (error) {
    if (error.message === 'Leave not found' || error.message === 'Invalid status') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Decide leave error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Schedule a meeting
 */
const createMeeting = async (req, res) => {
  try {
    const meeting = await meetingService.createMeeting(req.body, req.user._id);
    res.status(201).json({ message: 'Meeting created', meeting });
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllMeetings = async (req, res) => {
  try {
    const meetings = await meetingService.getAllMeetings();
    res.json(meetings);
  } catch (error) {
    console.error('Get all meetings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const terminateEmployee = async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await employeeService.terminateEmployee(req.params.id, reason);
    res.json({ message: 'Employee terminated successfully', result });
  } catch (error) {
    if (error.message === 'Termination reason is required' || error.message === 'User not found') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Terminate employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}


const promoteEmployee = async (req, res) => {
  try {
    const { designation, remarks } = req.body;
    const result = await employeeService.promoteEmployee(req.params.id, designation, req.user._id, remarks);
    res.json({ message: 'Employee promoted successfully', result });
  } catch (error) {
    if (error.message === 'New designation is required' || error.message === 'User not found') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Promote employee error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getHolidays = async (req, res) => {
  try {
    const holidays = await Holiday.find().sort({ date: 1 });
    res.json(holidays);
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAttendanceStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Daily Stats
    const totalEmployees = await User.countDocuments({ role: 'employee', status: 'active' });
    const presentEntries = await TimeEntry.find({
      date: { $gte: today, $lt: tomorrow }
    }).select('employeeId');

    const presentEmployeeIds = [...new Set(presentEntries.map(entry => entry.employeeId.toString()))];

    // Monthly Stats (Current Month)
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();

    // Aggregate total hours worked per day for the current month
    const monthlyStats = await TimeEntry.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear
        }
      },
      {
        $group: {
          _id: { day: { $dayOfMonth: "$date" } },
          totalHours: { $sum: "$hoursWorked" },
          presentCount: { $addToSet: "$employeeId" } // Unique employees
        }
      },
      {
        $project: {
          day: "$_id.day",
          totalHours: 1,
          presentCount: { $size: "$presentCount" },
          _id: 0
        }
      },
      { $sort: { day: 1 } }
    ]);

    // Employee Monthly Stats for filtering/sorting
    // Group by employee to count days present
    const employeeMonthlyStats = await TimeEntry.aggregate([
      {
        $match: {
          month: currentMonth,
          year: currentYear
        }
      },
      {
        $group: {
          _id: "$employeeId",
          daysPresent: { $sum: 1 }
        }
      }
    ]);

    res.json({
      daily: {
        total: totalEmployees,
        present: presentEmployeeIds.length,
        absent: totalEmployees - presentEmployeeIds.length,
        presentEmployeeIds // New field
      },
      monthly: monthlyStats,
      employeeStats: employeeMonthlyStats // New field: [{ _id: 'employeeId', daysPresent: 5 }, ...]
    });

  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Payroll operations
const paySalary = async (req, res) => {
  try {
    const { employeeId, month, year, basicSalary, allowances, deductions } = req.body;

    const netSalary = basicSalary + (allowances || 0) - (deductions || 0);

    // Check if already paid
    const existing = await Payroll.findOne({ employee: employeeId, month, year });
    if (existing) {
      return res.status(400).json({ message: 'Salary already paid for this month' });
    }

    const payroll = new Payroll({
      employee: employeeId,
      month,
      year,
      basicSalary,
      allowances: allowances || 0,
      deductions: deductions || 0,
      netSalary,
      paidBy: req.user._id
    });

    await payroll.save();

    // Generate Email with Salary Details (No Attachment)
    const user = await User.findById(employeeId);
    if (user && user.email) {
      try {
        const dashboardUrl = 'http://localhost:3000'; // Or process.env.CLIENT_URL
        const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const monthYear = `${monthNames[month - 1]} ${year}`;
        const subject = `Salary Slip - ${monthYear}`;

        console.log(`Sending salary slip email to ${user.email}...`);

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
                .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
                .header { background-color: #0d47a1; color: white; padding: 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 22px; font-weight: bold; }
                .content { padding: 30px; background-color: #fff; }
                .salary-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
                .salary-table th { text-align: left; padding: 12px; background-color: #f5f5f5; border-bottom: 2px solid #ddd; color: #555; text-transform: uppercase; font-size: 12px; }
                .salary-table td { padding: 12px; border-bottom: 1px solid #eee; }
                .salary-table tr:last-child td { border-bottom: none; }
                .amount { text-align: right; font-weight: bold; color: #333; }
                .net-pay-row { background-color: #e3f2fd; color: #0d47a1; font-weight: bold; font-size: 16px; }
                .net-pay-row td { border-top: 2px solid #0d47a1; border-bottom: none; }
                .footer { margin-top: 30px; font-size: 14px; color: #333; }
                p { line-height: 1.6; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome CRZ ACADEMIC REVIEW PVT LTD!</h1>
                </div>
                <div class="content">
                    <p>Dear ${user.name},</p>
                    <p>Your salary slip for <strong>${monthYear}</strong> has been generated.</p>
                    
                    <p>Here is a summary of your earnings and deductions:</p>
                    
                    <table class="salary-table">
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th style="text-align: right;">Amount (INR)</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>Basic Salary</td>
                                <td class="amount">₹${basicSalary.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Allowances</td>
                                <td class="amount">₹${(allowances || 0).toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td>Deductions</td>
                                <td class="amount" style="color: #d32f2f;">- ₹${(deductions || 0).toLocaleString()}</td>
                            </tr>
                            <tr class="net-pay-row">
                                <td>Net Salary Payable</td>
                                <td class="amount" style="color: #0d47a1;">₹${netSalary.toLocaleString()}</td>
                            </tr>
                        </tbody>
                    </table>

                    <p style="margin-top: 20px;">You can download the detailed salary slip PDF from your <a href="${dashboardUrl}" style="color: #0d47a1; text-decoration: underline;">Employee Portal</a>.</p>
                    
                    <div class="footer">
                        Best regards,<br>
                        CRZ Admin
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        await sendEmail({
          to: user.email,
          subject,
          text: `Dear ${user.name},\n\nYour salary slip for ${monthYear} is generated. Net Pay: ₹${netSalary}. Please login to download the PDF.\n\nBest regards,\nCRZ Admin`,
          html
        });
        console.log(`Salary detail email sent to ${user.email}`);

      } catch (emailError) {
        console.error('Failed to send salary slip email:', emailError);
        // Don't fail the request if email fails, just log it
      }
    }

    res.status(201).json(payroll);
  } catch (error) {
    console.error('Pay salary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getPayrollStatus = async (req, res) => {
  try {
    const { month, year } = req.query;
    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    // Return list of employee records who are paid for this month
    const paidRecords = await Payroll.find({ month, year }).select('employee paidAt netSalary basicSalary allowances deductions month year');
    res.json(paidRecords);
  } catch (error) {
    console.error('Get payroll status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getEmployeePayrollHistory = async (req, res) => {
  try {
    const records = await Payroll.find({ employee: req.params.employeeId })
      .sort({ year: -1, month: -1 });
    res.json(records);
  } catch (error) {
    console.error('Get employee payroll history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
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
  getHolidays,
  getAttendanceStats,
  paySalary,
  getPayrollStatus,
  getEmployeePayrollHistory,
  getEmployeeById
};
