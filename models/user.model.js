const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    otp: String,
    otpExpires: Date,
    fcmToken: String,

    userProfile: {
      age: Number,
      sex: String,
      weight: Number,
      height: Number,
      bmi: Number,
      hba1c: Number,
      medicationId: Number,
      jobTypeId: Number,
      dailyCalories: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);