const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const checkProfileComplete = require("../middleware/profileComplete");

const {
  startActivity,
  updateSteps,
  getStatus,
  updateWalkStatus
} = require("../controllers/activity.controller");

router.post("/start", authMiddleware, checkProfileComplete, startActivity);
router.put("/update", authMiddleware, checkProfileComplete, updateSteps);
router.get("/status", authMiddleware, checkProfileComplete, getStatus);

//walkstatus
router.patch("/walk-status", authMiddleware, checkProfileComplete, updateWalkStatus);

module.exports = router;
