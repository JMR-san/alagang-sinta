const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./config/db'); // MySQL DB connection
const userRoutes = require('./routes/userRoutes');
const path = require('path'); // Import the 'path' module

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve index.html for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Routes
app.use('/api/users', userRoutes);

// You can still have other API routes like this:
app.get('/api', (req, res) => {
    res.send('API is running...');
});

// Connect to DB and start server
const PORT = process.env.PORT || 3306;

// Get a connection from the pool to test the database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Failed to connect to MySQL:', err);
        process.exit(1); // Exit if DB connection fails
    }

    console.log('✅ Connected to MySQL database');
    // IMPORTANT: Release the connection immediately after the test is complete
    connection.release(); // This connection is just for the startup check, release it.

    // Now, start the Express server ONLY AFTER the database connection test is successful
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`Frontend served from http://localhost:${PORT}/`); // Access your frontend here
    });
});