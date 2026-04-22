const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOTP } = require('../utils/mailer');
const { setOTP, verifyOTP } = require('../utils/otpStore');

const router = express.Router();

// Send OTP
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email required' });
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already registered' });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  setOTP(email, otp);
  console.log(`OTP for ${email}: ${otp}`); // visible in backend console
  // attempt email but don't block registration if it fails
  sendOTP(email, otp).catch(e => console.error('Email send failed:', e.message));
  res.json({ message: 'OTP sent' });
});

// Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (verifyOTP(email, otp)) return res.json({ message: 'OTP verified' });
  res.status(400).json({ message: 'Invalid or expired OTP' });
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, dept, state, district, taluk } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, email, password: hashed, phone,
      role: role || 'citizen',
      dept: dept || null,
      state, district, taluk,
      isVerified: true
    });

    res.status(201).json({ message: 'Registered successfully' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, role: user.role, dept: user.dept, state: user.state, district: user.district, taluk: user.taluk },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, dept: user.dept, state: user.state, district: user.district, taluk: user.taluk }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;
