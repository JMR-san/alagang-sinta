const db = require('../config/db');

exports.insertUser = (name, email, message, callback) => {
  // Step 1: Get the latest ID
  db.query('SELECT id FROM users ORDER BY id DESC LIMIT 1', (err, result) => {
    if (err) return callback(err);

    let newId = 'PL001';
    if (result.length > 0) {
      // Extract the number part and increment
      const lastId = result[0].id; // e.g. "PL009"
      const lastNum = parseInt(lastId.slice(2)); // 9
      const nextNum = (lastNum + 1).toString().padStart(3, '0'); // "010"
      newId = 'PL' + nextNum;
    }

    // Step 2: Insert new record with the new ID
    db.query(
      'INSERT INTO users (id, name, email, message) VALUES (?, ?, ?, ?)',
      [newId, name, email, message],
      callback
    );
  });
};
