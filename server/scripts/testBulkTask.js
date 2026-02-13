import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createTask } from '../services/taskService.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

// Load env vars
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const test = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        // 1. Find or create an admin (assigner)
        let admin = await User.findOne({ role: 'admin' });
        if (!admin) {
            console.log('No admin found, cannot test.');
            process.exit(1);
        }

        // 2. Find employees
        const employees = await User.find({ role: 'employee' }).limit(3);
        if (employees.length < 2) {
            console.log(`Found ${employees.length} employees. Need at least 2 to test bulk assignment fully.`);
            if (employees.length === 0) {
                process.exit(1);
            }
        }

        const employeeIds = employees.map(e => e._id);
        console.log(`Assigning task to ${employeeIds.length} employees: ${employees.map(e => e.name).join(', ')}`);

        // 3. Create Bulk Task
        const taskData = {
            title: `Bulk Task Test ${Date.now()}`,
            description: 'This is a test task for multiple users',
            assignedTo: employeeIds, // Array of IDs
            dueDate: new Date(Date.now() + 86400000), // Tomorrow
            role: 'Web Developer'
        };

        console.log('Calling createTask...');
        const result = await createTask(taskData, admin._id);

        if (Array.isArray(result)) {
            console.log(`✅ Success! Created ${result.length} tasks.`);
            result.forEach(t => {
                console.log(` - Task "${t.title}" assigned to ${t.assignedTo.name} (ID: ${t._id})`);
            });
        } else {
            console.log('⚠️ Warning: Result is not an array (expected for bulk assignment).');
            console.log(result);
        }

        // Cleanup (optional, or kept for verification)
        // await Task.deleteMany({ title: { $regex: /Bulk Task Test/ } });
        // console.log('Cleaned up test tasks.');

    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

test();
