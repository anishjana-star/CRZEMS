
import { sendEmail } from '../utils/email.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const testWelcomeEmail = async () => {
    try {
        console.log('Testing Welcome Email...');

        const mockEmployee = {
            name: 'Testing 1',
            email: 'anishkumar12022004@gmail.com', // Using your email for testing
            password: '12c2277d8a497abd'
        };

        const dashboardUrl = 'http://localhost:3000';

        const subject = 'Welcome CRZ ACADEMIC REVIEW PVT LTD!🚀';

        const text = `Dear ${mockEmployee.name},

Congratulations and welcome to the team! We are thrilled to have you join us at CRZ ACADEMIC REVIEW PVT LTD.

To get you started, here are your login credentials for the employee portal:

Dashboard URL: ${dashboardUrl}

User ID (Email): ${mockEmployee.email}

Temporary Password: ${mockEmployee.password}


⚠️ For security reasons, we highly recommend that you change your password immediately after your first login.

If you have any questions or need assistance, please feel free to reach out to the HR department or your manager.

We look forward to working with you!

Best regards,
CRZ Management Team`;

        const html = `
        <p>Dear ${mockEmployee.name},</p>
        <p>Congratulations and welcome to the team! We are thrilled to have you join us at <strong>CRZ ACADEMIC REVIEW PVT LTD</strong>.</p>
        <p>To get you started, here are your login credentials for the employee portal:</p>
        <p><strong>Dashboard URL:</strong> <a href="${dashboardUrl}">${dashboardUrl}</a></p>
        <p><strong>User ID (Email):</strong> ${mockEmployee.email}</p>
        <p><strong>Temporary Password:</strong> ${mockEmployee.password}</p>
        <br>
        <p>⚠️ <strong>For security reasons, we highly recommend that you change your password immediately after your first login.</strong></p>
        <p>If you have any questions or need assistance, please feel free to reach out to the HR department or your manager.</p>
        <p>We look forward to working with you!</p>
        <p>Best regards,<br>CRZ Management Team</p>
        `;

        await sendEmail({
            to: mockEmployee.email,
            subject,
            text,
            html
        });

        console.log('Welcome email sent successfully.');

    } catch (error) {
        console.error('Welcome email failed:', error);
    }
};

testWelcomeEmail();
