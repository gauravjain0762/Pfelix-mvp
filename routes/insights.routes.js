const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const checkProfileComplete = require("../middleware/profileComplete");
const { getInsights } = require("../controllers/insights.controller");

router.get("/", authMiddleware, checkProfileComplete, getInsights);

module.exports = router;
