const Activity = require("../models/activity.model");
const MealScan = require("../models/mealscan.model");

// ✅ START ACTIVITY
exports.startActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const { mealScanId } = req.body;

    const scan = await MealScan.findById(mealScanId);

    if (!scan) {
      return res.status(404).json({
        success: false,
        message: "Meal scan not found"
      });
    }

    const suggestedSteps =
      scan.aiResult.course_correction.suggested_steps;

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const activity = await Activity.create({
      userId,
      mealScanId,
      suggestedSteps,
      startedAt: now,
      expiresAt
    });

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ UPDATE STEPS
exports.updateSteps = async (req, res) => {
  try {
    const { steps } = req.body;

    const activity = await Activity.findOne({
      userId: req.user.id,
      status: "active"
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "No active activity"
      });
    }

    // check expiry
    if (new Date() > activity.expiresAt) {
      activity.status = "expired";
      await activity.save();

      return res.json({
        success: false,
        message: "Activity expired"
      });
    }

    activity.stepsCompleted += steps;

    // check completion
    if (activity.stepsCompleted >= activity.suggestedSteps) {
      activity.status = "completed";
    }

    await activity.save();

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ STATUS
exports.getStatus = async (req, res) => {
  try {
    const activity = await Activity.findOne({
      userId: req.user.id
    }).sort({ createdAt: -1 });

    if (!activity) {
      return res.json({
        success: true,
        status: "none"
      });
    }

    const now = new Date();

    let status = activity.status;

    if (status === "active" && now > activity.expiresAt) {
      status = "expired";
      activity.status = "expired";
      await activity.save();
    }

    const timeLeft = Math.max(
      0,
      Math.floor((activity.expiresAt - now) / 1000)
    );

    res.json({
      success: true,
      status,
      stepsCompleted: activity.stepsCompleted,
      suggestedSteps: activity.suggestedSteps,
      stepsRemaining: Math.max(
        0,
        activity.suggestedSteps - activity.stepsCompleted
      ),
      timeLeftSeconds: timeLeft
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};