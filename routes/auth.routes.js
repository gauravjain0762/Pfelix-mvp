const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  signup,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  deleteAccount,
  saveDeviceToken,
  resendOtp
} = require("../controllers/auth.controller");

// Auth
router.post("/register", signup);
router.post("/login", login);

// Password
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);
router.post("/resend-otp", resendOtp);

// Delete account
router.delete("/delete-account", authMiddleware, deleteAccount);
router.post("/save-token", authMiddleware, saveDeviceToken);

module.exports = router;