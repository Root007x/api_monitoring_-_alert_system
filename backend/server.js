const express = require("express");
const cors = require("cors");
const dns = require("dns");

const { connectDB } = require("./config/db");
const alertRoutes = require("./routes/alertRoutes");
const { watchDBChanges, fetchLatestOnStart } = require("./utils/watchDb");

const app = express();
app.use(express.json());
app.use(cors());

dns.setServers(["1.1.1.1", "8.8.8.8"]);

// Connect MongoDB
connectDB();

// Routes
app.use("/alerts", alertRoutes);

// Start server
const PORT = 5000;
app.listen(PORT, async () => {
  console.log(`### Server running on port ${PORT}`);

  // Watch for DB changes
  await fetchLatestOnStart();
  watchDBChanges();
});