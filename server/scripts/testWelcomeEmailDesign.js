
import { sendEmail } from '../utils/email.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const testWelcomeEmailDesign = async () => {
    try {
        console.log('Testing Welcome Email Design...');

        const mockEmployee = {
            name: 'Testing 1',
            email: 'anishkumar12022004@gmail.com',
            password: '12c2277d8a497abd'
        };

        const dashboardUrl = 'http://localhost:3000';
        const subject = 'Welcome to Our Team! - Login Credentials';

        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; color: #333; }
                .container { max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; }
                .header { background-color: #0d47a1; color: white; padding: 20px; text-align: center; }
                .header h1 { margin: 0; font-size: 24px; }
                .header div { font-size: 30px; margin-top: 10px; }
                .content { padding: 20px; background-color: #fff; }
                .credentials-box { background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .credential-item { margin-bottom: 10px; }
                .label { font-weight: bold; color: #555; }
                .value { color: #0d47a1; }
                .value a { color: #0d47a1; text-decoration: underline; }
                .warning { color: #d32f2f; font-size: 14px; margin-top: 20px; }
                .footer { margin-top: 30px; font-size: 14px; color: #555; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome CRZ ACADEMIC REVIEW PVT LTD!</h1>
                    <div>🚀</div>
                </div>
                <div class="content">
                    <p>Dear ${mockEmployee.name},</p>
                    <p>Congratulations and welcome to the team! We are thrilled to have you join us at <strong>CRZ ACADEMIC REVIEW PVT LTD</strong>.</p>
                    <p>To get you started, here are your login credentials for the employee portal:</p>
                    
                    <div class="credentials-box">
                        <div class="credential-item">
                            <span class="label">Dashboard URL:</span> 
                            <span class="value"><a href="${dashboardUrl}">${dashboardUrl}</a></span>
                        </div>
                        <div class="credential-item">
                            <span class="label">User ID (Email):</span> 
                            <span class="value"><a href="mailto:${mockEmployee.email}">${mockEmployee.email}</a></span>
                        </div>
                        <div class="credential-item">
                            <span class="label">Temporary Password:</span> 
                            <span class="value" style="background: #e0e0e0; padding: 2px 5px; border-radius: 3px; color: #333;">${mockEmployee.password}</span>
                        </div>
                    </div>

                    <p>You can change your password on your EMS Portal.</p>

                    <p class="warning">
                        ⚠️ <strong>For security reasons, we highly recommend that you change your password immediately after your first login.</strong>
                    </p>
                    
                    <p>If you have any questions or need assistance, please feel free to reach out to the HR department or your manager.</p>
                    
                    <p>We look forward to working with you!</p>
                    
                    <div class="footer">
                        Best regards,<br>
                        CRZ Management Team
                    </div>
                </div>
            </div>
        </body>
        </html>
        `;

        // Check if inline styles are preferred for email clients, usually yes.
        // For simplicity in this script I used a style block, but for the actual controller I will inline critical styles to ensure Better compatibility.

        await sendEmail({
            to: mockEmployee.email,
            subject,
            text: `Welcome to the team! Your credentials: ${mockEmployee.email} / ${mockEmployee.password}`, // Fallback text
            html
        });

        console.log('Design test email sent.');

    } catch (error) {
        console.error('Design test failed:', error);
    }
};

testWelcomeEmailDesign();
