import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
    const user = await User.findOne({ email: 'admin@example.com' });
    console.log('Found user:', !!user, user ? { id: user._id.toString(), email: user.email, name: user.name, role: user.role } : null);
    if (user) {
      const isMatch = await user.comparePassword('admin123');
      console.log('Password match for admin123:', isMatch);
    }
    process.exit(0);
  } catch (err) {
    console.error('Debug DB error:', err);
    process.exit(1);
  }
};

run();