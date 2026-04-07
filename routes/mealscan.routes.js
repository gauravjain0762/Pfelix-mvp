const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const checkProfileComplete = require("../middleware/profileComplete");

const {
  predictMeal,
  getHistory,
  getSingleScan,
  deleteScan
} = require("../controllers/mealscan.controller");

router.post("/predict", authMiddleware, checkProfileComplete, upload.single("meal_image"), predictMeal);

router.get("/history", authMiddleware, checkProfileComplete, getHistory);
router.get("/:id", authMiddleware, checkProfileComplete, getSingleScan);
router.delete("/:id", authMiddleware, checkProfileComplete, deleteScan);

module.exports = router;
