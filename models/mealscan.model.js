const mongoose = require("mongoose");

const mealScanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    imageUrl: String,

    userProfile: Object, // flexible (good for AI context)

    mealContext: {
      meal_type: String,
      notes: String
    },

    aiResult: Object
  },
  { timestamps: true }
);

// auto delete after 30 days
mealScanSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 2592000 }
);

module.exports = mongoose.model("MealScan", mealScanSchema);