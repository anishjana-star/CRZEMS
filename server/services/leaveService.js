import Leave from '../models/Leave.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';
import eventBus from '../eventBus.js';

const applyLeave = async (employeeId, { startDate, endDate, reason }) => {
  if (!startDate || !endDate) throw new Error('Start and end dates are required');

  const s = new Date(startDate);
  const e = new Date(endDate);
  if (isNaN(s.getTime()) || isNaN(e.getTime())) throw new Error('Invalid date format');
  if (s > e) throw new Error('Start date must be before or equal to end date');

  const employee = await User.findById(employeeId);
  if (!employee) throw new Error('Employee not found');

  const leave = new Leave({
    employee: employeeId,
    startDate: s,
    endDate: e,
    reason: reason || ''
  });

  await leave.save();

  // Notify admins via email (best-effort) and emit event for realtime notification
  try {
    const admins = await User.find({ role: 'admin' });
    const adminEmails = admins.map(a => a.email).filter(Boolean);
    if (adminEmails.length) {
      const subject = `Leave request from ${employee.name}`;
      const text = `Employee ${employee.name} (${employee.email}) applied for leave from ${s.toDateString()} to ${e.toDateString()}.

Reason: ${reason || 'N/A'}`;
      for (const to of adminEmails) {
        try {
          await sendEmail({ to, subject, text });
        } catch (err) {
          console.error('Failed to send leave notification to admin', to, err);
        }
      }
    }
  } catch (err) {
    console.error('Failed to notify admins about leave application:', err);
  }

  // Emit event for socket notification (include employee details)
  try {
    eventBus.emit('leaveApplied', {
      leaveId: leave._id,
      employeeId: employeeId,
      employeeName: employee.name,
      employeeEmail: employee.email,
      startDate: s,
      endDate: e,
      reason: reason || ''
    });
  } catch (err) {
    console.error('Failed to emit leaveApplied event:', err);
  }

  return await leave.populate('employee', 'name email');
};

const getAllLeaves = async () => {
  return await Leave.find()
    .populate('employee', 'name email')
    .populate('decidedBy', 'name email')
    .sort({ appliedAt: -1 });
};

const getEmployeeLeaves = async (employeeId) => {
  return await Leave.find({ employee: employeeId })
    .populate('employee', 'name email')
    .populate('decidedBy', 'name email')
    .sort({ appliedAt: -1 });
};

const decideLeave = async (leaveId, adminId, status) => {
  if (!['approved', 'declined'].includes(status)) throw new Error('Invalid status');

  const leave = await Leave.findById(leaveId).populate('employee', 'name email');
  if (!leave) throw new Error('Leave not found');

  leave.status = status;
  leave.decidedBy = adminId;
  leave.decisionAt = new Date();

  await leave.save();

  // Notify employee via email
  try {
    await sendEmail({
      to: leave.employee.email,
      subject: `Your leave request has been ${status}`,
      text: `Hello ${leave.employee.name},\n\nYour leave from ${leave.startDate.toDateString()} to ${leave.endDate.toDateString()} has been ${status}.\n\nRegards, HR`
    });
  } catch (err) {
    console.error('Failed to send leave decision email:', err);
  }

  // Emit realtime event for sockets (include decider details)
  try {
    let decider = null;
    try {
      decider = await User.findById(adminId).select('name email');
    } catch (e) {
      // ignore
    }
    eventBus.emit('leaveDecision', {
      leaveId: leave._id,
      employeeId: leave.employee._id,
      status,
      decidedBy: adminId,
      decidedByName: decider?.name,
      decidedByEmail: decider?.email
    });
  } catch (err) {
    console.error('Failed to emit leaveDecision event:', err);
  }

  await leave.populate('employee', 'name email');
  await leave.populate('decidedBy', 'name email');

  return leave;
};

export { applyLeave, getAllLeaves, getEmployeeLeaves, decideLeave };
