require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(express.json()); // Parses JSON requests
app.use(cors()); // Enables CORS
app.use(morgan("dev")); // Logs requests



// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
