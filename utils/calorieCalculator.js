const { medications, jobTypes } = require("./constants");

const calculateCalories = (profile) => {
  const { age, sex, weight, height, hba1c, medicationId, jobTypeId } = profile;

  // BMR (Mifflin-St Jeor)
  let bmr;

  if (sex === "male") {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }

  // job activity factor
  const jobFactor = jobTypes[jobTypeId]?.factor || 1.2;

  // medication factor
  const medFactor = medications[medicationId]?.factor || 1;

  // final calories
  let dailyCalories = bmr * jobFactor * medFactor;

  // adjust based on HbA1c
  if (hba1c > 6.5) {
    dailyCalories *= 0.9;
  }

  dailyCalories = Math.round(dailyCalories);

  return {
    dailyCalories,
    mealBudget: {
      breakfast: Math.round(dailyCalories * 0.25),
      lunch: Math.round(dailyCalories * 0.35),
      snack: Math.round(dailyCalories * 0.10),
      dinner: Math.round(dailyCalories * 0.30)
    }
  };
};

module.exports = calculateCalories;