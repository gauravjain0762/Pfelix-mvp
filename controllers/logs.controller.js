const MealScan = require("../models/mealscan.model");
const Activity = require("../models/activity.model");

exports.getLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    const filter = req.query.filter || "day";

    let startDate = new Date();

    // ✅ FILTER LOGIC
    if (filter === "day") {
      startDate.setHours(0, 0, 0, 0);
    }

    if (filter === "week") {
      startDate.setDate(startDate.getDate() - 7);
    }

    if (filter === "month") {
      startDate.setDate(startDate.getDate() - 30);
    }

    // ✅ GET MEALS
    const meals = await MealScan.find({
      userId,
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // ✅ GET ALL ACTIVITIES (OPTIMIZED)
    const activities = await Activity.find({
      userId,
      createdAt: { $gte: startDate }
    });

    // map for fast lookup
    const activityMap = {};
    activities.forEach(a => {
      activityMap[a.mealScanId] = a;
    });

    const results = meals.map(meal => {

      const activity = activityMap[meal._id] || null;

      const peak =
        meal.aiResult?.glucose_prediction?.predicted_peak_mgdl || 0;

      // ✅ FIX: use safe baseline fallback
      const baseline = 110;

      const impactValue = peak - baseline;

      const impact =
        impactValue > 0
          ? `+${impactValue}`
          : `${impactValue}`;

      const suggestedSteps =
        meal.aiResult?.course_correction?.suggested_steps || 0;

      const stepsCompleted = activity?.stepsCompleted || 0;

      const walkStatus = activity?.status || "pending";

      const foods = meal.aiResult?.detected_items || [];

      const mealName = foods.length
        ? foods.map(f => f.name).join(" + ")
        : "Meal";

      return {
        mealId: meal._id,
        mealType: meal.mealContext?.meal_type || "meal",
        mealName,
        impact,
        suggestedSteps,
        stepsCompleted,
        walkStatus,
        createdAt: meal.createdAt
      };
    });

    res.json({
      success: true,
      count: results.length,
      data: results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};