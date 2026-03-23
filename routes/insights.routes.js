const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { getInsights } = require("../controllers/insights.controller");

router.get("/", authMiddleware, getInsights);

module.exports = router;