const db = require('./database/database');

// Create a table
db.run(`CREATE TABLE IF NOT EXISTS testuser (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT
)`, (err) => {
  if (err) {
    return console.error('Error creating table', err.message);
  }
  console.log('Table created successfully.');

  // Insert a record
  db.run(`INSERT INTO testuser (name, email) VALUES (?, ?)`, ['John Doe', 'john.doe@example.com'], function(err) {
    if (err) {
      return console.error('Error inserting record', err.message);
    }
    console.log(`A row has been inserted with rowid ${this.lastID}`);

    // Query the record
    db.get(`SELECT * FROM testuser WHERE id = ?`, [this.lastID], (err, row) => {
      if (err) {
        return console.error('Error querying record', err.message);
      }
      console.log('Record:', row);

      // Drop the table
      db.run(`DROP TABLE IF EXISTS testuser`, (err) => {
        if (err) {
          return console.error('Error dropping table', err.message);
        }
        console.log('Table dropped successfully.');
      });
    });
  });
});