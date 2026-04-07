const User = require("../models/user.model");
const calculateCalories = require("../utils/calorieCalculator");

// ✅ SETUP PROFILE
exports.setupProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const profile = {
      age: Number(req.body.age),
      sex: req.body.sex,
      weight: Number(req.body.weight),
      height: Number(req.body.height),
      bmi: req.body.bmi ? Number(req.body.bmi) : null,
      hba1c: Number(req.body.hba1c),
      medicationId: Number(req.body.medicationId || req.body.medication),
      jobTypeId: Number(req.body.jobTypeId || req.body.jobType)
    };


    //height validation
    if (profile.height < 140 || profile.height > 220) {
      return res.status(400).json({
        success: false,
        message: "Height must be between 140 cm and 220 cm"
      });
    }

    // ✅ calculate BMI if missing
    if (!profile.bmi) {
      const heightMeters = profile.height / 100;
      profile.bmi = profile.weight / (heightMeters * heightMeters);
    }

    // ✅ calculate calories
    const result = calculateCalories(profile);

    // ✅ update user (ONLY ONCE - fixed your duplicate bug)
    await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          isProfileComplete: true,
          userProfile: {
            ...profile,
            dailyCalories: result.dailyCalories
          }
        }
      },
      { new: true }
    );

    //height labels helper
    const heightinFeet = (cm) => {
      const inches = cm / 2.54;
      const ft = Math.floor(inches / 12);
      const inch = Math.round(inches % 12);
      return `${ft}'${inch}"`;
    };

    res.json({
      success: true,
      dailyCalories: result.dailyCalories,
      mealBudget: result.mealBudget,
    // added: better response
    profile: {
      ...profile,
      heightLabel: heightinFeet(profile.height)
    }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user || !user.userProfile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }

    const dailyCalories = user.userProfile.dailyCalories;

    res.json({
      success: true,
      name: user.name,
      profile: user.userProfile,
      mealBudget: {
        breakfast: Math.round(dailyCalories * 0.25),
        lunch: Math.round(dailyCalories * 0.35),
        snack: Math.round(dailyCalories * 0.10),
        dinner: Math.round(dailyCalories * 0.30)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const user = await User.findById(userId);

    if (!user || !user.userProfile) {
      return res.status(404).json({
        success: false,
        message: "User profile not found"
      });
    }

    // ✅ merge existing + new updates
    const profile = {
      ...user.userProfile.toObject(),
      ...updates
    };

    //height validation
    if (profile.height < 140 || profile.height > 220) {
      return res.status(400).json({
        success: false,
        message: "Height must be between 140 cm and 220 cm"
      });
      }

    // ✅ recalculate BMI if needed
    if (profile.weight && profile.height) {
      const heightMeters = profile.height / 100;
      profile.bmi = profile.weight / (heightMeters * heightMeters);
    }

    // ✅ recalculate calories
    const result = calculateCalories(profile);
    profile.dailyCalories = result.dailyCalories;

    user.userProfile = profile;

    await user.save();

    const heightinFeet = (cm) => {
      const inches = cm / 2.54;
      const ft = Math.floor(inches / 12);
      const inch = Math.round(inches % 12);
      return `${ft}'${inch}"`;
    };

    res.json({
      success: true,
      message: "Profile updated successfully",
      profile: {
        ...profile,
        heightLabel: heightinFeet(profile.height)
      },
      mealBudget: result.mealBudget
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};
