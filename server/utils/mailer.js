const nodemailer = require('nodemailer');

let transporter = null;

function createTransport() {
  // Use env config in production; in dev, log to console if not set
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn('[MAILER] SMTP not configured. Using console logging.');
    return null;
  }
  
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    connectionTimeout: 10000, // 10 second timeout
    socketTimeout: 10000,
    tls: {
      rejectUnauthorized: false // Allow self-signed certs
    }
  });
}

async function sendOtpEmail(to, otp) {
  const subject = 'Your Homigo verification code';
  const text = `Your verification code is ${otp}. It expires in 10 minutes.`;
  
  if (!transporter) {
    transporter = createTransport();
  }

  if (!transporter) {
    console.log(`[MAILER-DEV] OTP for ${to}: ${otp}`);
    return;
  }

  // Send email asynchronously (fire-and-forget) with timeout
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Email send timeout')), 8000)
  );

  Promise.race([
    new Promise((resolve, reject) => {
      transporter.sendMail(
        { 
          from: process.env.SMTP_FROM || process.env.SMTP_USER, 
          to, 
          subject, 
          text 
        },
        (error, info) => {
          if (error) {
            console.error('[MAILER] Email failed:', error.message);
            reject(error);
          } else {
            console.log('[MAILER] Email sent successfully');
            resolve(info);
          }
        }
      );
    }),
    timeoutPromise
  ]).catch(err => {
    console.error('[MAILER] Async error:', err.message);
  });
}

module.exports = { sendOtpEmail };
