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
    const { mealScanId, steps } = req.body;

    // ✅ validation
    if (!mealScanId || steps === undefined) {
      return res.status(400).json({
        success: false,
        message: "mealScanId and steps are required"
      });
    }

    if (steps < 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid steps"
      });
    }

    const activity = await Activity.findOne({
      userId: req.user.id,
      mealScanId
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found"
      });
    }

    // ✅ prevent update after completion
    if (activity.status === "completed") {
      return res.json({
        success: true,
        message: "Activity already completed",
        data: activity
      });
    }

    // ✅ expiry check
    if (new Date() > activity.expiresAt) {
      activity.status = "expired";
      await activity.save();

      return res.json({
        success: false,
        message: "Activity expired",
        data: activity
      });
    }

    // ✅ overwrite steps (FIXED)
    activity.stepsCompleted = steps;

    // ✅ completion check
    if (activity.stepsCompleted >= activity.suggestedSteps) {
      activity.status = "completed";
    }

    await activity.save();

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

//Walk status
exports.updateWalkStatus = async (req, res) => {
  try {
    const { mealScanId, walkStatus } = req.body;

    if (!mealScanId || !walkStatus) {
      return res.status(400).json({
        success: false,
        message: "mealScanId and walkstatus required"
      });
    }

    const activity = await Activity.findOne({
      userId: req.user.id,
      mealScanId
    });

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found"
      });
    }

    //expiry check
if (new Date() > activity.expiresAt) {
      activity.status = "expired";
      activity.walkStatus = "expired";

      await activity.save();

      return res.json({
        success: false,
        message: "Activity expired",
        data: activity
      });
    }

    // update walkStatus
    activity.walkStatus = walkStatus;

    // ✅ completion check
    if (walkStatus === "completed") {
      activity.status = "completed";
      activity.stepsCompleted = activity.suggestedSteps;
    }

    await activity.save();

    res.json({
      success: true,
      data: activity
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};



// ✅ STATUS
exports.getStatus = async (req, res) => {
  try {
    const { mealScanId } = req.query;

    // ✅ validation
    if (!mealScanId) {
      return res.status(400).json({
        success: false,
        message: "mealScanId is required"
      });
    }

    const activity = await Activity.findOne({
      userId: req.user.id,
      mealScanId
    });

    // ✅ pending state
    if (!activity) {
      return res.json({
        success: true,
        status: "pending",
        walkStatus: "pending",
        stepsCompleted: 0,
        suggestedSteps: 0,
        stepsRemaining: 0,
        timeLeftSeconds: 0
      });
    }

    const now = new Date();
    let status = activity.status;

    // ✅ expiry handling
    if (status === "active" && now > activity.expiresAt) {
      status = "expired";
      activity.status = "expired";
      await activity.save();
    }

    const timeLeft = Math.max(
      0,
      Math.floor((activity.expiresAt - now) / 1000)
    );

    const stepsRemaining =
      status === "completed"
        ? 0
        : Math.max(0, activity.suggestedSteps - activity.stepsCompleted);

    const progressPercent = activity.suggestedSteps
      ? Math.round(
          (activity.stepsCompleted / activity.suggestedSteps) * 100
        )
      : 0;

    res.json({
      success: true,
      status,
      walkStatus: activity.walkStatus,
      stepsCompleted: activity.stepsCompleted,
      suggestedSteps: activity.suggestedSteps,
      stepsRemaining,
      progressPercent,
      timeLeftSeconds: timeLeft
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};