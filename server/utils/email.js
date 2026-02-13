import nodemailer from 'nodemailer';

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    console.warn('SMTP not fully configured. Email sending will be disabled. Check .env variables.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(port),
    secure: Number(port) === 465, // true for 465, false for other ports
    auth: {
      user,
      pass
    }
  });
};

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  const transporter = createTransporter();
  const from = process.env.EMAIL_FROM || process.env.SMTP_USER;

  if (!transporter) {
    // For development: log the email
    console.info('Email skipped (no transporter configured):', { to, subject, text });
    return;
  }

  const msg = {
    from,
    to,
    subject,
    text,
    html,
    attachments
  };

  await transporter.sendMail(msg);
};

export { sendEmail };
