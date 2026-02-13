import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const resetAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Find or create admin user
    let admin = await User.findOne({ email: 'admin@example.com' });
    
    if (admin) {
      console.log('Admin user found. Resetting password...');
      // Set plain password - pre-save hook will hash it
      admin.password = 'admin123';
      await admin.save();
      console.log('✅ Admin password reset successfully!');
    } else {
      console.log('Admin user not found. Creating new admin...');
      // Create new admin - set plain password, pre-save hook will hash it
      admin = new User({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'admin123', // Plain text - will be hashed by pre-save hook
        role: 'admin',
        salary: 0,
        workHours: 8
      });
      await admin.save();
      console.log('✅ Admin user created successfully!');
    }
    
    // Reload admin to get the hashed password from DB
    admin = await User.findOne({ email: 'admin@example.com' });

    console.log('\n📧 Email: admin@example.com');
    console.log('🔑 Password: admin123');
    console.log('\n⚠️  Please change the password after first login!');

    // Verify the password works
    const testMatch = await admin.comparePassword('admin123');
    console.log(`\n✅ Password verification test: ${testMatch ? 'PASSED' : 'FAILED'}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

resetAdmin();
