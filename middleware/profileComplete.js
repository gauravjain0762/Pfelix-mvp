const User = require("../models/user.model");

const checkProfileComplete = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (!user.isProfileComplete) {
      return res.status(403).json({
        success: false,
        message: "Complete your profile first"
      });
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = checkProfileComplete;
