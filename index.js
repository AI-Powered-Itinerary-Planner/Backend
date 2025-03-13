import express from 'express';
const app = express();
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('database.sqlite', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');

        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT UNIQUE,
            password TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS itinerary (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            title TEXT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            destination TEXT NOT NULL,
            description TEXT,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )`);
    }
});

app.use(express.json());

app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    
    db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`, [name, email, password], (err) => {
        if (err) {
        res.status(400).send(err.message);
        } else if (!name || !email || !password) {
        res.status(400).send('Please provide all required fields');
        }
        else {
        res.status(201).send('User registered successfully');
        }
    });

});


app.get('/', (req, res) => {
  res.send('test');
});

app.listen(3000, () => {
  console.log('http://localhost:3000');
});
