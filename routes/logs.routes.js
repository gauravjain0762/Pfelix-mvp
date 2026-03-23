const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const { getLogs } = require("../controllers/logs.controller");

router.get("/", authMiddleware, getLogs);

module.exports = router;