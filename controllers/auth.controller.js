const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendEmail } = require("../services/email.service");
const Otp = require("../models/otp.model");

// 🔐 Generate Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// ✅ SIGNUP
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "user already exists" });
    }

    //generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    //hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // save OTP to DB
    await Otp.findOneAndUpdate(
      { email },
      {
        email,
        otp,
        name,
        password: hashedPassword,
        expiresAt: Date.now() + 5 * 60 * 1000
      },
      { upsert: true }
    );

    // send OTP email
    await sendEmail(
      email,
      "Pfelix OTP Verification",
      `Your OTP is ${otp}. It will expire in 5 minutes.`
    );

    res.json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // token
    const token = generateToken(user._id);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.otp = otp;
    user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 min

    await user.save();

    await sendEmail(
      user.email,
      "Pfelix OTP Verification",
      `Your OTP is ${otp}. It will expire in 10 minutes.`
    );

    res.json({
      success: true,
      message: "OTP sent to email"
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    if (record.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (record.expiresAt < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    //create user after virification
    const user = await User.create({
      name: record.name,
      email: record.email,
      password: record.password
    });

    //delete OTP record
    await Otp.deleteOne({ email });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "User verified successful",
      token,
      user
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false });
  }
};

exports.resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const record = await Otp.findOne({ email });
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Please register again"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    record.otp = otp;
    record.expiresAt = Date.now() + 5 * 60 * 1000; // 5 min
    await record.save();
    await sendEmail(
      email,
      "Pfelix OTP Verification",
      `Your new OTP is ${otp}. It will expire in 5 minutes.`
    );
    res.json({
      success: true,
      message: "OTP resent successful"
    });
  } catch (error) {
    res.status(500).json({ success: false });
  }
};



exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || user.otpExpires < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP"
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};

exports.saveDeviceToken = async (req, res) => {
  try {
    const { deviceToken } = req.body;

    if (!deviceToken) {
      return res.status(400).json({
        success: false,
        message: "Device token required"
      });
    }

    await User.findByIdAndUpdate(req.user.id, {
      fcmToken: deviceToken
    });

    res.json({
      success: true,
      message: "Device token saved"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};