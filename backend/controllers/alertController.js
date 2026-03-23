const Alert = require("../models/Alert");

const handleAlert = async (data) => {
  console.log("### ALERT RECEIVED:");
  console.log(data);
};

const getRecentAlerts = async (req, res) => {
  try {
    const recentAlerts = await Alert.find().sort({ timeStamp: -1 }).limit(10);
    if (recentAlerts.length) {
      res.json(recentAlerts);
    } else {
      res.status(404).json({ message: "No alerts found" });
    }
  } catch (err) {
    console.error("Error fetching alerts:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { handleAlert, getRecentAlerts };