import * as authService from '../services/authService.js';

/**
 * Handle user login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    if (error.message === 'Invalid credentials' || error.message === 'Please provide email and password') {
      return res.status(401).json({ message: error.message });
    }
    console.error('Login error:', error);
    // In development, return error details to help debug
    if (process.env.NODE_ENV !== 'production') {
      return res.status(500).json({ message: 'Server error', error: error.message, stack: error.stack });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get current authenticated user
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await authService.getUserById(req.user._id);
    res.json({ user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) return res.status(400).json({ message: 'Old and new passwords are required' });

    const result = await (await import('../services/employeeService.js')).changeOwnPassword(req.user._id, oldPassword, newPassword);
    res.json({ message: 'Password changed', user: result });
  } catch (error) {
    if (error.message === 'Old password is incorrect' || error.message.startsWith('Password') || error.message === 'User not found') {
      return res.status(400).json({ message: error.message });
    }
    console.error('Change own password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export {
  login,
  getCurrentUser,
  changePassword,
  updateEmail
};

const updateEmail = async (req, res) => {
  try {
    const { newEmail, password } = req.body;

    // Only Admin Check (as per user request)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins are allowed to change their email.' });
    }

    const result = await authService.updateEmail(req.user._id, newEmail, password);
    res.json({ message: 'Email updated successfully', user: result });
  } catch (error) {
    if (error.message === 'Invalid password' || error.message.includes('Email is already')) {
      return res.status(400).json({ message: error.message });
    }
    console.error('Update email error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
