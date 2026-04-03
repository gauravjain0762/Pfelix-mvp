const User = require("../models/user.model");
const MealScan = require("../models/mealscan.model");
const analyzeMeal = require("../services/openai.service");
const { checkMealTime } = require("../utils/mealTimeValidator");

// ✅ PREDICT MEAL
exports.predictMeal = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Meal image required"
      });
    }

    // ✅ DAILY LIMIT
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const scansToday = await MealScan.countDocuments({
      userId,
      createdAt: { $gte: today }
    });

    if (scansToday >= 4) {
      return res.status(429).json({
        success: false,
        message: "Daily scan limit reached (4/day)"
      });
    }

    const imageUrl = req.file.path;

    const user = await User.findById(userId);

    if (!user || !user.userProfile) {
      return res.status(400).json({
        success: false,
        message: "User profile not setup"
      });
    }

    // ✅ CLEAN PROFILE FOR AI
    const userProfile = {
  age_years: user.userProfile.age,
  sex: user.userProfile.sex,
  height_cm: user.userProfile.height,
  weight_kg: user.userProfile.weight,
  hba1c_percent: user.userProfile.hba1c,

  // map medication ID → string
  medication:
    user.userProfile.medicationId === 2
      ? "insulin"
      : "tablets"
};

    const mealContext = {
      meal_type: req.body.meal_type || "meal",
      notes: req.body.notes || ""
    };

    const mealType = mealContext.meal_type;

    const mealWarning = checkMealTime(mealType);

    // ✅ CALL AI
    const aiResult = await analyzeMeal(
      imageUrl,
      userProfile,
      mealContext
    );

    // ✅ SAVE
    const mealScan = await MealScan.create({
      userId,
      imageUrl,
      userProfile,
      mealContext,
      aiResult
    });

    res.json({
      success: true,
      data: mealScan,

      warning: mealWarning || null
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message || "Server error"
    });
  }
};

// ✅ HISTORY
exports.getHistory = async (req, res) => {
  try {
    const scans = await MealScan
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      data: scans
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ✅ SINGLE
exports.getSingleScan = async (req, res) => {
  try {
    const scan = await MealScan.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found"
      });
    }

    res.json({
      success: true,
      data: scan
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// ✅ DELETE
exports.deleteScan = async (req, res) => {
  try {
    const scan = await MealScan.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Scan not found"
      });
    }

    res.json({
      success: true,
      message: "Scan deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};