// In-memory OTP store { email: { otp, expiresAt } }
const otpStore = {};

const setOTP = (email, otp) => {
  otpStore[email] = { otp, expiresAt: Date.now() + 10 * 60 * 1000 };
};

const verifyOTP = (email, otp) => {
  const record = otpStore[email];
  if (!record) return false;
  if (Date.now() > record.expiresAt) { delete otpStore[email]; return false; }
  if (record.otp !== otp) return false;
  delete otpStore[email];
  return true;
};

module.exports = { setOTP, verifyOTP };
