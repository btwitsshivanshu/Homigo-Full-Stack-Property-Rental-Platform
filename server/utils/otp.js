const crypto = require('crypto');
const bcrypt = require('bcryptjs');

function generateOtp(length = 6) {
  // Numeric OTP of given length
  const max = Math.pow(10, length) - 1;
  const min = Math.pow(10, length - 1);
  const otp = Math.floor(min + Math.random() * (max - min + 1));
  return String(otp);
}

async function hashOtp(otp) {
  const saltRounds = 10;
  return bcrypt.hash(otp, saltRounds);
}

async function verifyOtp(otp, hash) {
  if (!otp || !hash) return false;
  return bcrypt.compare(otp, hash);
}

module.exports = { generateOtp, hashOtp, verifyOtp };