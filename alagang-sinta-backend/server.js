const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const supabase = require('./supabaseClient');
const userController = require('./controllers/userController');
const submitFormController = require('./controllers/submitFormController');
const { generateBatchIds } = require('./utils/idGenerator');

const app = express(); // ✅ Declare app first!
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Generate IDs endpoint
app.post('/api/generate-ids', async (req, res) => {
  try {
    console.log('Received request body:', req.body); // Debug log
    const { tableName, columnName, prefix, count, digits = 4 } = req.body;
    
    if (!tableName || !columnName || !prefix || !count) {
      return res.status(400).json({ 
        error: 'Missing required parameters',
        received: { tableName, columnName, prefix, count }
      });
    }

    console.log('Generating IDs with params:', { tableName, columnName, prefix, count, digits }); // Debug log
    const ids = await generateBatchIds(tableName, columnName, prefix, count, digits);
    console.log('Generated IDs:', ids, 'Lengths:', ids.map(id => id.length)); // Debug log
    
    // Validate ID format before sending
    const invalidIds = ids.filter(id => id.length > 9);
    if (invalidIds.length > 0) {
      console.error('Invalid ID lengths detected:', invalidIds);
      return res.status(400).json({
        error: 'Generated IDs exceed maximum length',
        invalidIds
      });
    }
    
    res.json({ ids });
  } catch (error) {
    console.error('Error generating IDs:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack // Include stack trace for debugging
    });
  }
});

// Get all pets from Supabase
app.get('/api/pets', async (req, res) => {
  const { data, error } = await supabase
    .from('pet_details')
    .select('*');

  if (error) {
    console.error('Supabase error:', error.message);
    return res.status(500).json({ error: 'Failed to fetch pets' });
  }

  res.json(data);
});

// Login and register routes
app.post('/api/login', userController.login);
app.post('/api/register', userController.register);
app.post('/submit', submitFormController.submitForm);

// Debug
console.log('Register route loaded:', typeof userController.register);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`POST /api/login`);
  console.log(`GET  /api/pets`);
  console.log(`POST /api/generate-ids`);
});
