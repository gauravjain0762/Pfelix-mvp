const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

const {
  getBaselineGlucose
} = require("../controllers/glucose.controller");

// ✅ YOUR API
router.get("/baseline", authMiddleware, getBaselineGlucose);

module.exports = router;