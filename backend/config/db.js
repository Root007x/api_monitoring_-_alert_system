const mongoose = require("mongoose");
const MONGO_API = process.env.MONGO_API;

const MONGO_URI = MONGO_API;

// connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Connection Error", err);
  }
};

module.exports = { connectDB };