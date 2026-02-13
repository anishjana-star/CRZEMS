import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Authenticate user and return token
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {object} Token and user data
 */
export const login = async (email, password) => {
  if (!email || !password) {
    throw new Error('Please provide email and password');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (user.status === 'terminated') {
    throw new Error('Account terminated. Please contact administration.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
};

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {object} User data
 */
export const getUserById = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    throw new Error('User not found');
  }

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    salary: user.salary,
    workHours: user.workHours
  };
};

export const updateEmail = async (userId, newEmail, password) => {
  if (!newEmail || !password) throw new Error('New email and password are required');

  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid password');

  // Check if email is already taken
  const existingUser = await User.findOne({ email: newEmail });
  if (existingUser && existingUser._id.toString() !== userId.toString()) {
    throw new Error('Email is already in use by another account');
  }

  user.email = newEmail;
  await user.save();

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
};
