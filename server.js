require("dotenv").config();
require("./jobs/activityReminder.job");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const metaRoutes = require("./routes/meta.routes");

const app = express();

// middleware
app.use(cors());
app.use(express.json());

// DB connect
connectDB();

// routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/profile", require("./routes/profile.routes"));
app.use("/api/glucose", require("./routes/glucose.routes"));
app.use("/api/mealscan", require("./routes/mealscan.routes"));
app.use("/api/activity", require("./routes/activity.routes"));
app.use("/api/insights", require("./routes/insights.routes"));
app.use("/api/logs", require("./routes/logs.routes"));
app.use("/api/meta", metaRoutes);
app.use("/api/meta", metaRoutes)

app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));