const MealScan = require("../models/mealscan.model");
const Activity = require("../models/activity.model");

exports.getInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    const { filter, startDate, endDate } = req.query;
    
    let since = new Date();
    let until = new Date(); //default to now

    if (filter === "week") {
      since.setDate(since.getDate() - 7);
    }
      else if (filter === "month") {
      since.setMonth(since.getMonth() - 1);
    }
     else if (filter === "custom") {

  if (startDate && endDate) {
    // ✅ both provided
    since = new Date(startDate);
    until = new Date(endDate);
  } 
  else if (startDate && !endDate) {
    // ✅ only startDate → till today
    since = new Date(startDate);
    until = new Date(); // today
  } 
  else {
    return res.status(400).json({
      success: false,
      message: "startDate is required for custom filter"
    });
  }
}
      else {
        since.setDate(since.getDate() - 7);
    }

    //fix time
    since.setHours(0, 0, 0, 0);
    until.setHours(23, 59, 59, 999);

    //get meals
    const meals = await MealScan.find({
      userId,
      createdAt: {
        $gte: since,
        $lte: until
      }
    });

    let greenMeals = 0;
    let redMeals = 0;
    let sugarTotal = 0;

    const foodMap = {};

    meals.forEach(meal => {
      const peak =
        meal.aiResult?.glucose_prediction?.predicted_peak_mgdl || 0;

      if (!peak) return;

      sugarTotal += peak;

      if (peak <= 160) greenMeals++;
      else redMeals++;

      const foods = meal.aiResult?.detected_items || [];

      foods.forEach(item => {
        if (!foodMap[item.name]) {
          foodMap[item.name] = {
            count: 0,
            spikeTotal: 0
          };
        }

        foodMap[item.name].count += 1;
        foodMap[item.name].spikeTotal += peak;
      });
    });

    //  AVG SUGAR
    const avgSugar = meals.length
      ? Math.round(sugarTotal / meals.length)
      : 0;

      //  GET ACTIVITIES
    const activities = await Activity.find({
      userId,
      createdAt: {
        $gte: since,
        $lte: until
      }
    });

    const totalSteps = activities.reduce(
      (sum, a) => sum + (a.stepsCompleted || 0),
      0
    );

    const avgSteps = activities.length
      ? Math.round(totalSteps / activities.length)
      : 0;

      //  TOP FOODS
    const topFoods = Object.entries(foodMap)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgSpike: Math.round(data.spikeTotal / data.count)
      }))
      .sort((a, b) => b.avgSpike - a.avgSpike)
      .slice(0, 4);

    res.json({
      success: true,
      data: {
        greenMeals,
        redMeals,
        avgSugar,
        avgSteps,
        topFoods
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
      };