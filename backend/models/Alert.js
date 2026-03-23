const mongoose = require("mongoose");
const COLLECTION_NAME = process.env.COLLECTION_NAME;

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

const Alert = mongoose.model("Alert", alertSchema, COLLECTION_NAME);

module.exports = Alert;