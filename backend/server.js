const express = require('express');
const cors = require('cors');
require('dotenv').config();

const counsellingRoutes = require('./routes/counsellingRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests (typically running on localhost:3000)
app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);

// Middleware for parsing JSON requests
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', authRoutes);
app.use('/api', counsellingRoutes);


// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'College ERP Counselling backend is running successfully.'
  });
});

app.listen(PORT, () => {
  console.log(`Server started and listening on http://localhost:${PORT}`);
});
