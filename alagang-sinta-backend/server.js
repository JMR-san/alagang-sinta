const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const supabase = require('./supabaseClient');
const userController = require('../controllers/userController');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/assets', express.static(path.join(__dirname, '..', 'assets')));

//get all pets
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

//stattic files
app.use(express.static('public'));

// login and register route
app.post('/api/login', userController.login);
app.post('/api/register', userController.register);

//debug
console.log('Register route loaded:', typeof userController.register);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`POST /api/login`);
  console.log(`GET  /api/pets`);
});