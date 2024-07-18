const express = require("express");
const app = express();

const cors = require("cors");
var compression = require("compression");
const db = require("./configs/db");

const corsOptions = {
  origin: "*", // Allow all origins
  allowedHeaders: "*", // Allow all headers
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allow these methods including PATCH
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(compression());

// app.use(all_routes)

app.get("/live", (req, res) => {
  res.send("Server is live!");
});

app.get("/", (req, res) => {
  res.send("Server is live!");
});

module.exports = app;
