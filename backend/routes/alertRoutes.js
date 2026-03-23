const express = require("express");
const router = express.Router();
const { handleAlert, getRecentAlerts } = require("../controllers/alertController");

// POST /alerts
router.post("/", async (req, res) => {
  await handleAlert(req.body);
  res.json({ status: "received" });
});

// GET /alerts
router.get("/", getRecentAlerts);

module.exports = router;