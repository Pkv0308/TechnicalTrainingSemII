// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Allows parsing JSON from React

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully'))
  .catch((err) => console.log('Database connection error: ', err));

// Register API Routes
app.use('/api/auth', require('./routes/Auth'));
app.use('/api/jobs', require('./routes/Jobs')); 
// ... rest of the server.js file ...


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected successfully'))
  .catch((err) => console.log('Database connection error: ', err));

// Basic test route
app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));