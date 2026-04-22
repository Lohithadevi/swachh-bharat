const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const sendOTP = async (to, otp) => {
  if (process.env.DISABLE_EMAIL === 'true') {
    console.log(`[OTP] ${to}: ${otp}`);
    return;
  }
  await transporter.sendMail({
    from: `"SwachhBharath Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Email Verification OTP',
    html: `<p>Your OTP for SwachhBharath registration is: <strong>${otp}</strong></p><p>Valid for 10 minutes.</p>`
  });
};

const sendNotification = async (to, subject, message) => {
  if (process.env.DISABLE_EMAIL === 'true') {
    console.log(`[MAIL SKIPPED] To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"SwachhBharath Portal" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `<p>${message}</p>`
  });
};

module.exports = { sendOTP, sendNotification };
