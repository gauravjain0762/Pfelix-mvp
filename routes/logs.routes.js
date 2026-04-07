const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const checkProfileComplete = require("../middleware/profileComplete");
const { getLogs } = require("../controllers/logs.controller");

router.get("/", authMiddleware, checkProfileComplete, getLogs);

module.exports = router;
