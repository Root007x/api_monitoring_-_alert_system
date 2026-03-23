const Alert = require("../models/Alert");
const { handleAlert } = require("../controllers/alertController");
const mongoose = require("mongoose");

const fetchLatestOnStart = async () => {
  try {
    const latest = await Alert.findOne().sort({ timeStamp: -1 });
    if (latest) {
      console.log("###Latest alert fetched on startup:");
      await handleAlert(latest);
    } else {
      console.log("### No alerts in database yet");
    }
  } catch (err) {
    console.error("Error fetching latest alert:", err.message);
  }
};

const watchDBChanges = () => {
  mongoose.connection.once("open", () => {
    console.log("### Watching for DB changes...");

    const changeStream = Alert.watch();
    changeStream.on("change", async (change) => {
      if (change.operationType === "insert") {
        const latestData = change.fullDocument;
        console.log("New Alert Detected:", latestData);
        await handleAlert(latestData);
      }
    });
  });
};

module.exports = { fetchLatestOnStart, watchDBChanges };