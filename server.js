require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  phone: String,
  password: String,
  salt: String,
  resetPasswordToken: String,
  streams: [{ // Add streams array to track user's active streams
    streamId: String,
    rtspUrl: String,
    startTime: Date,
    breaches:[{
      time: Date,
      photo: String,
      status: String

    }]
  }]
});

const User = mongoose.model('User', userSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ success: false, message: 'Access denied' });

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });

    req.userId = decoded.id;
    next();
  });
};

// Nodemailer Configuration
const sendMail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      html,
    });
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, message: 'Failed to send email' };
  }
};

// Get User Info
app.get('/api/user-info', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Logout (Optional - Blacklist token or just inform client)
app.post('/api/logout', (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});


// Signup (User Registration)
app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, phone, password: hashedPassword, salt });
    await newUser.save();

    res.status(201).json({ success: true, message: 'User registered successfully!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login (User Authentication)
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Compare password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset Password Request
app.post('/api/request-reset-password', async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email });
    if (user) {
      const token = crypto.randomBytes(48).toString('hex');
      user.resetPasswordToken = token;
      await user.save();

      const resetPageLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}&email=${email}`;
      const subject = 'Reset Password for Your Account';
      const html = `<p>Click <a href="${resetPageLink}">here</a> to reset your password.</p>`;

      const response = await sendMail({ to: email, subject, html });
      res.json(response);
    } else {
      res.status(400).json({ success: false, message: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Reset Password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, password, token } = req.body;
    const user = await User.findOne({ email, resetPasswordToken: token });
    if (user) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hashedPassword = await bcrypt.hash(password, 10);

      user.password = hashedPassword;
      user.salt = salt;
      user.resetPasswordToken = null; // Clear reset token
      await user.save();

      const subject = 'Password Reset Successful';
      const html = `<p>Your password has been successfully reset.</p>`;
      const response = await sendMail({ to: email, subject, html });
      res.json(response);
    } else {
      res.status(400).json({ success: false, message: 'Invalid email or token' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Start Server
app.listen(5000, () => console.log('Server running on http://localhost:5000'));
