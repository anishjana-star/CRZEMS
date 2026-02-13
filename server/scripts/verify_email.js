import nodemailer from 'nodemailer';
import { sendEmail } from '../utils/email.js';

// Mock process.env if needed, but we rely on .env file loaded by server or default
// Since this is a standalone script, we might need to load dotenv if we want to test actual sending.
// However, we just want to verify the function works if arguments are correct.

async function verifyEmail() {
    console.log('Testing sendEmail function...');
    try {
        const testAttachment = {
            filename: 'test.txt',
            content: 'This is a test attachment content.'
        };

        // We can't really test sending without valid SMTP credentials.
        // But we can check if it throws an error about "attachments" property.

        // We will just log ensuring no syntax error in email.js
        console.log('Email utility loaded successfully.');

        // Attempt send if credentials exist (this might fail if not configured, which is fine)
        if (process.env.SMTP_HOST) {
            await sendEmail({
                to: 'admin@example.com',
                subject: 'Test Email',
                text: 'Hello',
                html: '<p>Hello</p>',
                attachments: [testAttachment]
            });
            console.log('Email sent or attempted.');
        } else {
            console.log('SMTP not configured, skipping actual send.');
        }

        console.log('Verification script completed.');

    } catch (error) {
        console.error('Verification failed:', error);
    }
}

verifyEmail();
