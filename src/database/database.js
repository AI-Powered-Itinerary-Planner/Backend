const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Initialize tables without users data now 
db.initializeTables = async function() {
  try {
    // Drop and recreate users table to fix schema issues
    console.log('Dropping users table if exists...');
    await this.promiseRun(`DROP TABLE IF EXISTS users`);
    
    // Create users table
    console.log('Creating users table with correct schema...');
    await this.promiseRun(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE NOT NULL,
      password TEXT,
      interests TEXT,
      auth_provider TEXT,
      auth_id TEXT,
      age INTEGER,
      country TEXT,
      zip_code TEXT,
      preferred_currency TEXT
    )`);
    console.log('Users table created with correct schema');
    
    // Itineraries table with auth_id
    console.log('Creating itineraries table if not exists...');
    await this.promiseRun(`CREATE TABLE IF NOT EXISTS itineraries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      auth_id TEXT NOT NULL, 
      title TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      destination TEXT NOT NULL,
      description TEXT
    )`);
    console.log('Itineraries table created or already exists');

    console.log('Database tables initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing tables:', error.message);
    return false;
  }
};

// Function to alter the users table and add the interests column
db.alterTable = async function() {
  try {
    await this.promiseRun(`ALTER TABLE users ADD COLUMN interests TEXT`);
    console.log('Interests column added successfully');
    return true;
  } catch (error) {
    if (error.message.includes('duplicate column name')) {
      console.log('Interests column already exists');
      return true;
    } else {
      console.error('Error altering table:', error.message);
      return false;
    }
  }
};

// Helper for promises
db.promiseRun = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

db.promiseGet = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
};

db.promiseAll = function(sql, params = []) {
  return new Promise((resolve, reject) => {
    this.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

module.exports = db;