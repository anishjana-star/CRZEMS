import Task from '../models/Task.js';
import User from '../models/User.js';
import { sendEmail } from '../utils/email.js';

/**
 * Create a new task
 * @param {object} taskData - Task data
 * @param {string} assignedBy - Admin user ID
 * @returns {object} Created task
 */
const createTask = async (taskData, assignedBy) => {
  const { title, description, assignedTo, dueDate, role } = taskData;

  if (!title || !assignedTo) {
    throw new Error('Title and assignedTo are required');
  }

  const employee = await User.findById(assignedTo);
  if (!employee || employee.role !== 'employee') {
    throw new Error('Employee not found');
  }

  const task = new Task({
    title,
    description: description || '',
    assignedTo,
    assignedBy,
    dueDate: dueDate || null,
    role: role || null
  });

  await task.save();
  await task.populate('assignedTo', 'name email');

  // Send assignment email to employee (best-effort)
  try {
    await sendEmail({
      to: employee.email,
      subject: `New task assigned: ${task.title}`,
      text: `Hello ${employee.name},\n\nA new task has been assigned to you: ${task.title}\n\nDescription: ${task.description || 'No description'}\nDue: ${task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}\n\nPlease check your dashboard.`
    });
  } catch (err) {
    console.error('Failed to send task assignment email:', err);
  }

  // Emit an internal event so sockets can notify the user in real-time
  try {
    const eventBus = (await import('../eventBus.js')).default;
    eventBus.emit('taskAssigned', { task: task.toObject ? task.toObject() : task, employeeId: assignedTo });
  } catch (err) {
    console.error('Failed to emit taskAssigned event:', err);
  }

  return task;
};

/**
 * Get all tasks
 * @returns {array} List of tasks
 */
const getAllTasks = async () => {
  return await Task.find()
    .populate('assignedTo', 'name email')
    .populate('assignedBy', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Get tasks assigned to employee
 * @param {string} employeeId - Employee ID
 * @returns {array} List of tasks
 */
const getEmployeeTasks = async (employeeId) => {
  return await Task.find({ assignedTo: employeeId })
    .populate('assignedBy', 'name email')
    .sort({ createdAt: -1 });
};

/**
 * Update task status
 * @param {string} taskId - Task ID
 * @param {string} employeeId - Employee ID
 * @param {string} status - New status
 * @returns {object} Updated task
 */
const updateTaskStatus = async (taskId, employeeId, status) => {
  if (!['pending', 'in-progress', 'completed'].includes(status)) {
    throw new Error('Invalid status');
  }

  const task = await Task.findOneAndUpdate(
    { _id: taskId, assignedTo: employeeId },
    { status },
    { new: true }
  ).populate('assignedBy', 'name email');

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
};

export {
  createTask,
  getAllTasks,
  getEmployeeTasks,
  updateTaskStatus
};
