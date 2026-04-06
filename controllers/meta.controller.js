exports.getHeights = async (req, res) => {
  try {
    const heights = [];

    for (let ft = 5; ft <= 7; ft++) {
      for (let inch = 0; inch < 12; inch++) {

        const totalInches = ft * 12 + inch;
        const cm = Math.round(totalInches * 2.54);

        heights.push({
          label: `${ft}'${inch}"`,   // for dropdown
          value: cm                  // store in DB
        });
      }
    }

    res.json({
      success: true,
      heights
    });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};


// 🔥 ADD THIS FUNCTION
const { checkMealTime } = require("../utils/mealTimeValidator");

exports.getBreakfastTip = async (req, res) => {
  try {
    res.json({
      success: true,
      mealType: "breakfast",
      tip: "Breakfast time is 8:00am-9:00am"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getLunchTip = async (req, res) => {
  try {
    res.json({
      success: true,
      mealType: "lunch",
      tip: "Lunch time is between 11:00am-2:00pm"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.getDinnerTip = async (req, res) => {
  try {
    res.json({
      success: true,
      mealType: "dinner",
      tip: "Dinner time is 7:00pm-9:00pm"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

exports.checkMealTimeApi = async (req, res) => {
  try {
    const { meal_type } = req.body;

    if (!meal_type) {
      return res.status(400).json({
        success: false,
        message: "meal_type is required"
      });
    }

    const warning = checkMealTime(meal_type);

    res.json({
      success: true,
      warning: warning || null
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
