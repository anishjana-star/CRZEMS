import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Holiday from '../models/Holiday.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const holidays = [
    { date: '2026-01-01', day: 'Thursday', name: "New Year's Day" },
    { date: '2026-01-26', day: 'Monday', name: 'Republic Day' },
    { date: '2026-03-04', day: 'Wednesday', name: 'Holi (Colour Diwas)' },
    { date: '2026-08-15', day: 'Saturday', name: 'Independence Day' },
    { date: '2026-08-28', day: 'Friday', name: 'Rakhi Bandhan' },
    { date: '2026-10-02', day: 'Friday', name: 'Mahatma Gandhi Jayanti' },
    { date: '2026-10-18', day: 'Sunday', name: 'Durga Puja - Maha Saptami*' },
    { date: '2026-10-19', day: 'Monday', name: 'Durga Puja - Maha Ashtami' },
    { date: '2026-10-20', day: 'Tuesday', name: 'Durga Puja - Maha Navami' },
    { date: '2026-10-21', day: 'Wednesday', name: 'Durga Puja - Vijaya Dashami' },
    { date: '2026-10-25', day: 'Sunday', name: 'Lakshmi Puja*' },
    { date: '2026-11-08', day: 'Sunday', name: 'Kali Puja / Diwali*' },
    { date: '2026-11-11', day: 'Wednesday', name: 'Bhai Dooj (Bhatridwitiya)' },
    { date: '2026-11-15', day: 'Sunday', name: 'Chhath Puja*' }
];

const seedHolidays = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/employee_management');
        console.log('MongoDB Connected');

        await Holiday.deleteMany({});
        console.log('Cleared existing holidays');

        // Adjust years if needed, assuming current year or next based on context. Screenshot didn't specify year, using 2026 as per user context time (2026).
        const currentYear = new Date().getFullYear();

        const formattedHolidays = holidays.map(h => ({
            ...h,
            date: new Date(h.date) // Ensure date string is parsed correctly
        }));

        await Holiday.insertMany(formattedHolidays);
        console.log('Holidays seeded successfully');

        process.exit();
    } catch (error) {
        console.error('Error seeding holidays:', error);
        process.exit(1);
    }
};

seedHolidays();
