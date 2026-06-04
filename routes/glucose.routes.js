const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");
const checkProfileComplete = require("../middleware/profileComplete");

const {
  getBaselineGlucose,
  addBloodSugar,
  getBloodSugarHistory
} = require("../controllers/glucose.controller");

router.get("/baseline", authMiddleware, checkProfileComplete, getBaselineGlucose);
router.post("/add", authMiddleware, addBloodSugar);
router.get("/history", authMiddleware, getBloodSugarHistory);

module.exports = router;
