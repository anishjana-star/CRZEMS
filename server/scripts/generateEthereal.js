
import nodemailer from 'nodemailer';

async function createTestAccount() {
    try {
        const testAccount = await nodemailer.createTestAccount();
        console.log(`SMTP_HOST=${testAccount.smtp.host}`);
        console.log(`SMTP_PORT=${testAccount.smtp.port}`);
        console.log(`SMTP_USER=${testAccount.user}`);
        console.log(`SMTP_PASS=${testAccount.pass}`);
    } catch (err) {
        console.error('Failed to create test account:', err);
    }
}

createTestAccount();
