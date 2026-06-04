const User = require("../models/user.model");
const BloodSugar = require("../models/bloodsugar.model");
const calculateBaselineGlucose = require("../utils/glucoseCalculator");

exports.getBaselineGlucose = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user || !user.userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    const hba1c = user.userProfile.hba1c;

    if (!hba1c) {
      return res.status(400).json({
        success: false,
        message: "HbA1c not available"
      });
    }

    const result = calculateBaselineGlucose(hba1c);

    res.json({
      success: true,
      hba1c,
      estimatedAverageGlucose: result.eAG,
      baselineGlucose: result.baseline
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// GET /api/glucose/history
exports.getBloodSugarHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 30, page = 1 } = req.query;

    const entries = await BloodSugar.find({ userId })
      .sort({ date: -1 })
      .skip((page - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .select("date fbs ppbs -_id");

    res.json({ success: true, data: entries });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /api/glucose/add
exports.addBloodSugar = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date, fbs, ppbs } = req.body;

    if (!date) {
      return res.status(400).json({ success: false, message: "Date is required" });
    }

    if (fbs == null && ppbs == null) {
      return res.status(400).json({ success: false, message: "At least one of FBS or PPBS is required" });
    }

    // normalize to start of day (date-only key)
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);

    const entry = await BloodSugar.findOneAndUpdate(
      { userId, date: day },
      {
        $set: {
          ...(fbs != null && { fbs }),
          ...(ppbs != null && { ppbs })
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(201).json({ success: true, data: entry });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};