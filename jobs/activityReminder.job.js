const cron = require("node-cron");
const Activity = require("../models/activity.model");
const User = require("../models/user.model");
const sendNotification = require("../services/notification.service");

cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking activity reminders...");

  const now = new Date();

  const activities = await Activity.find({
    status: "active"
  });

  for (const activity of activities) {

    const user = await User.findById(activity.userId);

    if (!user?.fcmToken) continue;

    const minutesPassed =
      (now - activity.startedAt) / (1000 * 60);

    // 🔔 FIRST NOTIFICATION (5 min)
    if (
      minutesPassed >= 5 &&
      !activity.notifiedAt1Hour
    ) {
      await sendNotification(
        user.fcmToken,
        "Start Walking 🚶‍♂️",
        `Time to walk! Complete ${activity.suggestedSteps} steps.`
      );

      activity.notifiedAt1Hour = true;
      await activity.save();
    }

    // 🔔 SECOND NOTIFICATION (65 min)
    if (
      minutesPassed >= 65 &&
      !activity.notifiedAt2Hour
    ) {
      await sendNotification(
        user.fcmToken,
        "Keep Going 💪",
        "You're halfway there! Keep walking to complete your goal."
      );

      activity.notifiedAt2Hour = true;
      await activity.save();
    }

    // ⏳ EXPIRE AFTER 120 MIN
    if (now > activity.expiresAt) {
      activity.status = "expired";
      await activity.save();
    }
  }
});