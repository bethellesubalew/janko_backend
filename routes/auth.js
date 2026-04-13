 const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');

// temporary OTP store
let otpStore = {};

// ==========================
// 📩 SEND OTP
// ==========================
router.post("/send-otp", async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Phone required" });
  }

  // 🔢 generate OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();

  otpStore[phone] = otp;

  console.log(`OTP for ${phone}: ${otp}`);

  res.json({ message: "OTP sent" });
});


// ==========================
// ✅ VERIFY OTP (🔥 THIS IS STEP 2)
// ==========================
router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    const storedOtp = otpStore[phone];

    if (!storedOtp) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if (storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // delete OTP after success
    delete otpStore[phone];

    // 🔍 find user (optional but better)
    let user = await User.findOne({ phone });

    // if user does NOT exist → auto create (nice UX)
    if (!user) {
      user = new User({
        phone,
        password: "otp_user", // dummy password
        role: "customer"
      });
      await user.save();
    }

    // 🔐 create JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.json({
      message: "OTP verified",
      token,
      user
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// 🔐 REGISTER (optional now)
// ==========================
router.post('/register', async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      phone,
      password: hashedPassword,
      role: role || "customer"
    });

    await user.save();

    res.status(201).json({
      message: 'User registered successfully',
      user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// 🔐 LOGIN (keep for admin/rider)
// ==========================
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Wrong password' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role
      },
      process.env.JWT_SECRET || "secret123",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;