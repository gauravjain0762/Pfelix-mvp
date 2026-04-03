const express = require("express");
const router = express.Router();

const { getHeights, checkMealTimeApi } = require("../controllers/meta.controller");

router.get("/heights", getHeights);

router.post("/check-meal-time", checkMealTimeApi);

module.exports = router;