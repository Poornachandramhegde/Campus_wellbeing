const pool = require('../config/db');

/**
 * Get all users (Protected)
 * GET /api/users
 */
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, usn, email, role, department, semester, mentor_name, mentor_email, created_at 
       FROM users 
       ORDER BY id ASC`
    );

    return res.status(200).json({
      success: true,
      users: rows
    });
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user list.'
    });
  }
};

module.exports = {
  getUsers
};
