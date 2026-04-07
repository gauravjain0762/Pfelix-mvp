const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const checkProfileComplete = require("../middleware/profileComplete");

const {
  getBaselineGlucose
} = require("../controllers/glucose.controller");

// ✅ YOUR API
router.get("/baseline", authMiddleware, checkProfileComplete, getBaselineGlucose);

module.exports = router;
