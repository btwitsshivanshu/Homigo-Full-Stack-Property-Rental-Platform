const nodemailer = require('nodemailer');

function createTransport() {
  // Use env config in production; in dev, log to console if not set
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendOtpEmail(to, otp) {
  const transporter = createTransport();
  const subject = 'Your Homigo verification code';
  const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
  if (!transporter) {
    console.log(`[DEV] OTP for ${to}: ${otp}`);
    return;
  }
  await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER, to, subject, text });
}

module.exports = { sendOtpEmail };
