const mongoose = require("mongoose");

const bloodSugarSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    fbs: {
      type: Number,
      default: null
    },
    ppbs: {
      type: Number,
      default: null
    }
  },
  { timestamps: true }
);

// one entry per user per day
bloodSugarSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("BloodSugar", bloodSugarSchema);
