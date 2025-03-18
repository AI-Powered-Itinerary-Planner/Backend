require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const db = require('./database/database.js');
//* Models
const User = require('./models/userModel');

//* DB Routes
const userRoutes = require('./routes/users');

const app = express();

// Middleware
app.use(express.json()); // Parses JSON requests
app.use(cors()); // Enables CORS
app.use(morgan("dev")); // Logs requests

// Health check route
app.get("/", (req, res) => {
  res.send("Backend is running");
});

//* Add routes here
app.use('/users', userRoutes);


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
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
