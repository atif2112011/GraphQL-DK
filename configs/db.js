const db = require("mongoose");
require("dotenv").config();
async function connectToDatabase() {
  try {
    6;
    await db.connect(process.env.dburl);
    console.log("Connected to database");
  } catch (error) {
    console.error("Database connection error:", error);
  }
}

connectToDatabase();

module.exports = db;
