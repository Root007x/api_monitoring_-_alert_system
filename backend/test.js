const express = require("express")
const mongoose = require("mongoose")
const axios = require("axios")
const dns = require('dns');
const cors = require("cors");


const app = express();
app.use(express.json());
app.use(cors());

dns.setServers(['1.1.1.1', '8.8.8.8']);

// mongodb connection
const MONGO_URI = "mongodb+srv://brodyjason40_db_user:yWks6eEwQnyzuhS5@cluster0.c1025ax.mongodb.net/n8n_task?appName=Cluster0";

mongoose.connect(MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.error("MongoDB Connection Error", err));


// schema
const alertSchema = new mongoose.Schema({
  api_name: String,
  response_time_ms: Number,
  status_code: Number,
  records_returned: Number,
  issues: [
    {
      type: { type: String },
      severity: String,
    },
  ],
  alert_messages: String,
});

const Alert = mongoose.model("Alert", alertSchema, "alert");

const handleAlert = async (data) => {
  console.log("🚨 ALERT RECEIVED:");
  console.log(data);
};


app.post("/alerts", async (req, res) => {
    await handleAlert(req.body);
    res.json({status: "received"});
});

app.get("/alerts", async (req, res) => {
  try {
    const recentAlerts = await Alert.find().sort({ timeStamp: -1 }).limit(10); // get last 10 alerts
    if (recentAlerts.length) {
      res.json(recentAlerts);
    } else {
      res.status(404).json({ message: "No alerts found" });
    }
  } catch (err) {
    console.error("❌ Error fetching alerts:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
});


const fetchLatestOnStart = async () => {
  try {
    const latest = await Alert.findOne().sort({ timeStamp: -1 }); // get latest by timestamp
    if (latest) {
      console.log("📥 Latest alert fetched on startup:");
      await handleAlert(latest); // internal call to /alert
    } else {
      console.log("⚠️ No alerts in database yet");
    }
  } catch (err) {
    console.error("❌ Error fetching latest alert:", err.message);
  }
};

// Watch MongoDB for new inserts

mongoose.connection.once("open", async () => {
  console.log("👀 Watching for DB changes...");

  // Fetch latest alert on startup
  await fetchLatestOnStart();

  const changeStream = Alert.watch();
  changeStream.on("change", async (change) => {
    if (change.operationType === "insert") {
      const latestData = change.fullDocument;
      console.log("📥 New Alert Detected:", latestData);
      await handleAlert(latestData);
    }
  });
});

app.listen(3000, () => {
  console.log("🚀 Server running on port 3000");
});