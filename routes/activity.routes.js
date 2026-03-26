const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");

const {
  startActivity,
  updateSteps,
  getStatus,
  updateWalkStatus
} = require("../controllers/activity.controller");

router.post("/start", authMiddleware, startActivity);
router.put("/update", authMiddleware, updateSteps);
router.get("/status", authMiddleware, getStatus);

//walkstatus
router.patch("/walk-status", authMiddleware, updateWalkStatus);

module.exports = router;