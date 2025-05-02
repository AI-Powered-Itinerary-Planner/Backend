require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require('./database/database.js');
//* Models
const User = require('./models/userModel');

//* DB Routes
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
const itineraryRoutes = require('./routes/itineraries');
const exploreRoutes = require('./routes/explore');

const app = express();

// CORS configuration - Allow requests from any origin during development
app.use(cors({
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Middleware
app.use(express.json()); // Parses JSON requests
app.use(morgan("dev")); // Logs requests

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// Test route for debugging
app.get("/test", (req, res) => {
  console.log("Test route hit");
  res.json({ success: true, message: "Test route working" });
});

//* Add routes here
// Confirmed the backend routes configuration
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/itineraries', itineraryRoutes);
app.use('/explore', exploreRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// initiziazing database 
db.initializeTables()
  .then(success =>{
    if(success){
      console.log('Database Ready')
      return db.alterTable();
    }
    else{
      console.error('database initization failed ')
    }
  }

);

// Server Listening
const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.log(`Port ${PORT} is already in use. Trying alternative port ${PORT + 1}`);
    // Try to use the next port if the original one is in use
    const alternativePort = PORT + 1;
    app.listen(alternativePort, () => {
      console.log(`Server running on alternative port ${alternativePort}`);
    });
  } else {
    console.error('Server error:', error);
  }
});
