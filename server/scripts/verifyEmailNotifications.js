import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import User from '../models/User.js';
import Task from '../models/Task.js';
import * as employeeService from '../services/employeeService.js';
import * as taskService from '../services/taskService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const runVerification = async () => {
    await connectDB();

    try {
        console.log('--- Starting Verification ---');

        // 0. Cleanup from previous runs
        await User.deleteOne({ email: 'verify@example.com' });

        // 1. Create a test employee
        console.log('Creating test employee...');
        const testEmployee = await employeeService.createEmployee({
            name: 'Verification User',
            email: 'verify@example.com',
            salary: 50000,
            workHours: 8
        });
        console.log('Test employee created:', testEmployee.email);

        // 2. Promote employee
        console.log('Promoting employee...');
        // Mock admin ID (using the employee's own ID as promotedBy just for test, or find an admin)
        const admin = await User.findOne({ role: 'admin' });
        if (!admin) throw new Error('No admin found');

        await employeeService.promoteEmployee(testEmployee.id, 'Senior Verification Engineer', admin._id);
        console.log('Promotion email Triggered (Check logs)');

        // 3. Create a task and assign to employee
        console.log('Creating task...');
        const task = await taskService.createTask({
            title: 'Verification Task',
            description: 'Verify email notifications',
            assignedTo: testEmployee.id,
            role: 'Web Developer', // Valid role from enum
            dueDate: new Date(Date.now() + 86400000) // Tomorrow
        }, admin._id);
        console.log('Task created');

        // 4. Update task status (should trigger email to admin)
        console.log('Updating task status...');
        await taskService.updateTaskStatus(task._id, testEmployee.id, 'in-progress');
        console.log('Task update email Triggered (Check logs)');

        // 5. Terminate employee
        console.log('Terminating employee...');
        await employeeService.terminateEmployee(testEmployee.id, 'Verification Complete');
        console.log('Termination email Triggered (Check logs)');

        // 6. Change Own Password & Email (Simulate Admin)
        console.log('Simulating Admin Email Update...');
        // We won't actually change admin email to avoid breaking login for user, but we will test the function with a new temporary email then revert
        const originalEmail = admin.email;
        const tempEmail = 'admin_temp@example.com';

        // We need the admin's password. Since we don't have it, we can't fully test "changeOwnPassword" without resetting it.
        // However, we can unit-test the logic if we mock the password check, but that's invasive.
        // Instead, we will SKIP the actual execution of changeOwnPassword for Admin to be safe, 
        // as we can't know the admin's current password to pass to the function.
        // We'll rely on the manual verification for this specific part as per plan.
        console.warn('SKIPPING Admin Email Update verification script to avoid password reset issues. Please verify manually.');

        // Cleanup
        console.log('Cleaning up...');
        await User.findByIdAndDelete(testEmployee.id);
        await Task.findByIdAndDelete(task._id);
        console.log('Cleanup complete.');

    } catch (error) {
        console.error('Verification Failed:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
};

runVerification();
