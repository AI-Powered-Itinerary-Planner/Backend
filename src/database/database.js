const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// If you want to initialize the tables, you can create a separate function
db.initializeTables = async function() {
  try {
    // Users table
    await this.promiseRun(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      interests TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Itineraries table
    await this.promiseRun(`CREATE TABLE IF NOT EXISTS itineraries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      destination TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`);

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