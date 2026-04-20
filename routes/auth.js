 const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const allowedRoles = ["customer", "rider", "business"]//const token = generateToken(user._id, user.role);
const User = require('../models/User');

// ==========================
// 📦 TEMP OTP STORAGE
// ==========================
let otpStore = {};

// ==========================
// 🔐 JWT TOKEN GENERATOR
// ==========================
 function generateToken(userId, role) {
  return jwt.sign(
    {
      id: userId,
      role: role
    },
    process.env.JWT_SECRET || "secret123",
    { expiresIn: "7d" }
  );
}

// ==========================
// 📩 SEND OTP
// ==========================
router.post("/send-otp", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone required" });
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    otpStore[phone] = otp;

    console.log(`📩 OTP for ${phone}: ${otp}`);

    return res.json({
      message: "OTP sent successfully"
    });

  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

 router.post("/verify-otp", async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP required" });
    }

    const storedOtp = otpStore[phone];

    if (!storedOtp || storedOtp !== otp) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    delete otpStore[phone];

    // ✅ CHECK USER FIRST
   let user = await User.findOne({ phone });

let isNewUser = false;

if (!user) {
  isNewUser = true;

  user = await User.create({
    phone,
    role: "customer",
    status: "pending" // optional but better
  });
}
    const token = generateToken(user._id, user.role);

   return res.json({
  token,
  isNewUser, // ✅ ADD THIS LINE
  user: {
    id: user._id,
    phone: user.phone,
    role: user.role
  }
});

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: err.message });
  }
});
// ==========================
// 🔐 REGISTER (optional)
// ==========================
router.post('/register', async (req, res) => {
  try {
    const { phone, password, role } = req.body;

    const existingUser = await User.findOne({ phone });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      phone,
      password: hashedPassword,
     role: allowedRoles.includes(role) ? role : "customer"
    });

    await user.save();

    return res.status(201).json({
      message: 'User registered successfully',
      user
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

// ==========================
// 🔐 LOGIN
// ==========================
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: 'Wrong password'
      });
    }

    const token = generateToken(user._id, user.role);

    return res.json({
      message: 'Login successful',
      token,
      user
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});

module.exports = router;
// ==========================
// ✅ COMPLETE PROFILE
// ==========================
const authMiddleware = require('../middleware/authMiddleware');

 router.post("/complete-profile", authMiddleware, async (req, res) => {
  try {
    console.log("USER FROM TOKEN:", req.user); // 👈 ADD THIS

    const userId = req.user.id;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { name, status: "active" },
      { new: true }
    );

    return res.json({
      message: "Profile updated successfully",
      user
    });

  } catch (err) {
    console.error("COMPLETE PROFILE ERROR:", err);
    return res.status(500).json({ message: err.message });
  }
});