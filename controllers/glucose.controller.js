const User = require("../models/user.model");
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