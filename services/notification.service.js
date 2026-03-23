const admin = require("../config/firebase");

const sendNotification = async (token, title, body) => {
  try {
    await admin.messaging().send({
      token,
      notification: {
        title,
        body
      }
    });
  } catch (error) {
    console.error("Notification error:", error.message);
  }
};

module.exports = sendNotification;