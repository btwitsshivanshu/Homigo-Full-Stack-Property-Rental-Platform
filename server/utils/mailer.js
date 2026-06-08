const sgMail = require('@sendgrid/mail');

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('✅ SendGrid initialized');
}

async function sendOtpEmail(to, otp) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[MAILER-DEV] OTP for ${to}: ${otp}`);
    return;
  }

  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject: 'Your Homigo verification code',
      html: `
        <h2>Verify Your Email</h2>
        <p>Your verification code is: <strong>${otp}</strong></p>
        <p>This code expires in 10 minutes.</p>
      `
    });
    console.log('[MAILER] OTP sent to', to);
  } catch (error) {
    console.error('[MAILER] Error:', error.message);
  }
}

async function sendMail(to, subject, html) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log(`[MAILER-DEV] Email to ${to}: ${subject}`);
    return;
  }

  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL,
      subject,
      html
    });
    console.log('[MAILER] Email sent to', to);
  } catch (error) {
    console.error('[MAILER] Error:', error.message);
  }
}

module.exports = { sendOtpEmail, sendMail };
