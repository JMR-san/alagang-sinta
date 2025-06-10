const mysql = require('mysql2');
const express = require('express');
const app = express();

app.use(express.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'infoman',
  database: 'alagang_sinta'
});

db.connect(err => {
  if (err) throw err;
  console.log("MySQL Connected!");
});

app.post('/submit', (req, res) => {
  const { name, email, message } = req.body;
  db.query(
    'INSERT INTO users (name, email, message) VALUES (?, ?, ?)',
    [name, email, message],
    (err, results) => {
      if (err) throw err;
      res.send("Data saved!");
    }
  );
});

app.listen(3300, () => console.log("Server running on http://localhost:3300"));
