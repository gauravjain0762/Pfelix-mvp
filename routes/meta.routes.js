const express = require("express");
const router = express.Router();

const {
  getHeights,
  checkMealTimeApi,
  getBreakfastTip,
  getLunchTip,
  getDinnerTip
} = require("../controllers/meta.controller");

router.get("/heights", getHeights);
router.get("/tips/breakfast", getBreakfastTip);
router.get("/tips/lunch", getLunchTip);
router.get("/tips/dinner", getDinnerTip);

router.post("/check-meal-time", checkMealTimeApi);

module.exports = router;
