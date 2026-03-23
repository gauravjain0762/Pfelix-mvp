const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload.middleware");
const authMiddleware = require("../middleware/auth.middleware");

const {
  predictMeal,
  getHistory,
  getSingleScan,
  deleteScan
} = require("../controllers/mealscan.controller");

router.post("/predict", authMiddleware, upload.single("meal_image"), predictMeal);

router.get("/history", authMiddleware, getHistory);
router.get("/:id", authMiddleware, getSingleScan);
router.delete("/:id", authMiddleware, deleteScan);

module.exports = router;