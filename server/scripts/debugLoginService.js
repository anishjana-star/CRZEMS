import mongoose from 'mongoose';
import dotenv from 'dotenv';
import * as authService from '../services/authService.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    const res = await authService.login('admin@example.com', 'admin123');
    console.log('Login success:', res);
    process.exit(0);
  } catch (err) {
    console.error('AuthService login error:', err);
    process.exit(1);
  }
};

run();