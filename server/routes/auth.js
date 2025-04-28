const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const authMiddleware = require('../middleware/authMiddleware');
require('dotenv').config({ path: __dirname + '/../.env' });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (password.length < 8)
    return res.status(400).json({ message: 'Password must be at least 8 characters' });

  const exist = await User.findOne({ email });
  if (exist) return res.status(409).json({ message: 'Email already exists' });

  const hashed = await bcrypt.hash(password, 10);
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  const user = await User.create({
    name,
    email,
    password: hashed,
    verified: false,
    verificationCode
  });

  await transporter.sendMail({
    from: '"Alboom" <alboom.noreply@gmail.com>',
    to: email,
    subject: 'Verify your Alboom account',
    text: `Hi ${name},\n\nYour verification code is: ${verificationCode}\n\nPlease enter this code to activate your account.`,
  });

  res.status(201).json({ message: 'User created. Verification code sent to email.' });
});

router.post('/verify', async (req, res) => {
  const { email, code } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.verified) return res.status(400).json({ message: 'User already verified' });
  if (user.verificationCode !== code)
    return res.status(400).json({ message: 'Invalid verification code' });

  user.verified = true;
  user.verificationCode = undefined;
  await user.save();

  res.json({ message: 'Account verified successfully' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !await bcrypt.compare(password, user.password))
    return res.status(401).json({ message: 'Invalid credentials' });

  if (!user.verified)
    return res.status(403).json({ message: 'Please verify your email before logging in.' });

  const token = jwt.sign(
    { id: user._id, role: user.role, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '3h' }
  );

  res.json({ token });
});

router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'No account with that email' });

 
  const token = crypto.randomBytes(32).toString('hex');


  user.resetPasswordCode    = token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 60; // 1 hour
  await user.save();

  
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  await transporter.sendMail({
    from: '"Alboom" <alboom.noreply@gmail.com>',
    to: email,
    subject: 'Reset your Alboom password',
    html: `
      <p>Hi ${user.name},</p>
      <p>Click <a href="${resetUrl}">this link</a> to reset your password. It expires in one hour.</p>
    `
  });

  res.json({ message: 'Password reset link sent to your email address.' });
});

router.post('/reset-password', async (req, res) => {
  const { email, token, newPassword } = req.body;
  const user = await User.findOne({ email });


  if (
    !user ||
    user.resetPasswordCode !== token ||
    Date.now() > user.resetPasswordExpires
  ) {
    return res.status(400).json({ message: 'Invalid or expired reset link' });
  }

 
  user.password             = await bcrypt.hash(newPassword, 10);
  user.resetPasswordCode    = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.json({ message: 'Your password has been reset successfully.' });
});

router.post('/change-password', authMiddleware, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) return res.status(401).json({ message: 'Incorrect current password' });

  user.password = await bcrypt.hash(newPassword, 10);
  await user.save();

  res.json({ message: 'Password updated successfully' });
});

router.get('/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user.id).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

module.exports = router;
