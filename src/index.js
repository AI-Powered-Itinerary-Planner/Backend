require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

//* Models
const User = require('./models/userModel');

//* DB Routes
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(express.json()); // Parses JSON requests
app.use(cors()); // Enables CORS
app.use(morgan("dev")); // Logs requests


//* Initialize database
// ex: User.createTable();

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

//* Add routes here
app.use('/users', userRoutes);

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
