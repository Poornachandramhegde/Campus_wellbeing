const express = require('express');
const router = express.Router();
const { getUsers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

// Protected user routes
router.get('/', authMiddleware, getUsers);

module.exports = router;
