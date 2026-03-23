// controllers/notification.controller.js

const User = require("../models/user.model");

exports.saveFcmToken = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, {
      fcmToken: req.body.token
    });

    res.json({ success: true });

  } catch (error) {
    res.status(500).json({ success: false });
  }
};