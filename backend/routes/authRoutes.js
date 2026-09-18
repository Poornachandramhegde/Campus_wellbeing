const express = require('express');
const router = express.Router();
const { signup, login, getMe, getMentors } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Public auth routes
router.post('/signup', signup);
router.post('/login', login);
router.get('/mentors', getMentors);

// Protected auth routes
router.get('/me', authMiddleware, getMe);

module.exports = router;
