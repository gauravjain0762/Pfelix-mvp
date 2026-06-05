const cron = require("node-cron");
const Activity = require("../models/activity.model");
const User = require("../models/user.model");
const sendNotification = require("../services/notification.service");

cron.schedule("* * * * *", async () => {
  const now = new Date();

  const activities = await Activity.find({ status: "active" });

  const notifiedUsers = new Set();

  for (const activity of activities) {
    try {
      const user = await User.findById(activity.userId);

      if (!user?.fcmToken) continue;

      // skip if user disabled walk reminders
      if (user.settings?.notifications?.postMealWalkReminder === false) continue;

      if (!activity.startedAt) continue;

      // skip if this user already got a notification this cron tick
      const userId = activity.userId.toString();
      if (notifiedUsers.has(userId)) continue;
      notifiedUsers.add(userId);

      const minutesPassed = (now - activity.startedAt) / (1000 * 60);
      const steps = activity.suggestedSteps || 0;

      // 🔔 FIRST NOTIFICATION (5 min)
      if (minutesPassed >= 5 && !activity.notifiedAt1Hour) {
        await sendNotification(
          user.fcmToken,
          "Start Walking 🚶‍♂️",
          steps > 0
            ? `Time to walk! Complete ${steps} steps to control your glucose.`
            : "Time for a post-meal walk to help control your glucose."
        );
        activity.notifiedAt1Hour = true;
        await activity.save();
      }
      // 🔔 SECOND NOTIFICATION (65 min)
      else if (minutesPassed >= 65 && !activity.notifiedAt2Hour) {
        await sendNotification(
          user.fcmToken,
          "Keep Going 💪",
          "You're halfway there! Keep walking to complete your goal."
        );
        activity.notifiedAt2Hour = true;
        await activity.save();
      }

      // ⏳ EXPIRE AFTER 120 MIN
      if (activity.expiresAt && now > activity.expiresAt) {
        activity.status = "expired";
        await activity.save();
      }

    } catch (err) {
      console.error(`Reminder error for activity ${activity._id}:`, err.message);
    }
  }
});