exports.checkMealTime = (mealType) => {
  const now = new Date();

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const timings = {
    breakfast: { start: 8 * 60, end: 9 * 60 },
    lunch: { start: 11 * 60, end: 14 * 60 },
    dinner: { start: 19 * 60, end: 21 * 60 }
  };

  // 🔥 safety check
  const meal = timings[mealType?.toLowerCase()];

  if (!meal) return null;

  // 🔥 only check "late"
  if (currentMinutes > meal.end) {
    return {
      status: "late",
      message: "Late meal time, You are scanning after time"
    };
  }

  return null; // ✅ valid or early (ignored)
};