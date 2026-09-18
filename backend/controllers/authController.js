const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

/**
 * Student / User Signup
 * POST /api/auth/signup
 */
const signup = async (req, res) => {
  const {
    name,
    usn,
    email,
    password,
    department,
    semester,
    mentor_id
  } = req.body;

  // 1. Validation
  if (!name || !usn || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Name, USN, email, and password are required fields.'
    });
  }

  const trimmedEmail = email.trim().toLowerCase();
  const trimmedUsn = usn.trim().toUpperCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address.'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }

  let connection;
  try {
    connection = await pool.getConnection();

    // 2. Check for duplicate email in users or user_login
    const [existingEmailInUsers] = await connection.query(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [trimmedEmail]
    );
    const [existingEmailInLogin] = await connection.query(
      'SELECT id FROM user_login WHERE email = ? LIMIT 1',
      [trimmedEmail]
    );

    if (existingEmailInUsers.length > 0 || existingEmailInLogin.length > 0) {
      connection.release();
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    // 3. Check for duplicate USN in users
    const [existingUsn] = await connection.query(
      'SELECT id FROM users WHERE usn = ? LIMIT 1',
      [trimmedUsn]
    );

    if (existingUsn.length > 0) {
      connection.release();
      return res.status(409).json({
        success: false,
        message: 'A student with this USN is already registered.'
      });
    }

    // 4. Retrieve Mentor Info if mentor_id is provided
    let mentorName = null;
    let mentorEmail = null;

    if (mentor_id) {
      const [mentorRows] = await connection.query(
        'SELECT name, email FROM mentors WHERE id = ? LIMIT 1',
        [mentor_id]
      );
      if (mentorRows.length > 0) {
        mentorName = mentorRows[0].name;
        mentorEmail = mentorRows[0].email;
      }
    }

    // 5. Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    let formattedSemester = null;
    if (semester !== undefined && semester !== null && semester !== '') {
      if (typeof semester === 'number') {
        formattedSemester = semester;
      } else {
        const match = String(semester).match(/\d+/);
        formattedSemester = match ? parseInt(match[0], 10) : semester;
      }
    }

    // 6. MySQL Transaction to create users and user_login records
    await connection.beginTransaction();

    const [userInsertResult] = await connection.query(
      `INSERT INTO users 
       (name, usn, email, password_hash, role, department, semester, mentor_name, mentor_email, created_at) 
       VALUES (?, ?, ?, NULL, 'student', ?, ?, ?, ?, NOW())`,
      [
        name.trim(),
        trimmedUsn,
        trimmedEmail,
        department ? department.trim() : null,
        formattedSemester,
        mentorName,
        mentorEmail
      ]
    );


    const newUserId = userInsertResult.insertId;

    await connection.query(
      `INSERT INTO user_login 
       (user_id, email, password_hash, is_active, created_at) 
       VALUES (?, ?, ?, 1, NOW())`,
      [newUserId, trimmedEmail, passwordHash]
    );

    await connection.commit();
    connection.release();

    return res.status(201).json({
      success: true,
      message: 'Signup successful. You can now log in.'
    });
  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
        connection.release();
      } catch (rollbackErr) {
        console.error('Error rolling back transaction:', rollbackErr);
      }
    }
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      message: 'Signup failed due to an internal server error.'
    });
  }
};

/**
 * Student / User Login
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }

  const trimmedEmail = email.trim().toLowerCase();

  try {
    // 1. Find user_login record by email
    const [loginRows] = await pool.query(
      'SELECT id, user_id, email, password_hash, is_active FROM user_login WHERE email = ? LIMIT 1',
      [trimmedEmail]
    );

    if (loginRows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const loginRecord = loginRows[0];

    // 2. Check if active
    if (!loginRecord.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Your account is deactivated. Please contact an administrator.'
      });
    }

    // 3. Compare password hash
    const isPasswordValid = await bcrypt.compare(password, loginRecord.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // 4. Retrieve associated profile from users table
    const [userRows] = await pool.query(
      `SELECT id, name, usn, email, role, department, semester, mentor_name, mentor_email, created_at 
       FROM users WHERE id = ? LIMIT 1`,
      [loginRecord.user_id]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.'
      });
    }

    const user = userRows[0];

    // 5. Update last_login timestamp
    await pool.query(
      'UPDATE user_login SET last_login = NOW() WHERE id = ?',
      [loginRecord.id]
    );

    // 6. Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role || 'student',
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d'
      }
    );

    // 7. Return safe user data + token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        usn: user.usn,
        role: user.role || 'student',
        department: user.department,
        semester: user.semester,
        mentor_name: user.mentor_name,
        mentor_email: user.mentor_email
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed due to an internal server error.'
    });
  }
};

/**
 * Get Authenticated User Profile
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const userId = req.user.id;
    const [userRows] = await pool.query(
      `SELECT id, name, usn, email, role, department, semester, mentor_name, mentor_email, created_at 
       FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found.'
      });
    }

    const user = userRows[0];

    return res.status(200).json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        usn: user.usn,
        role: user.role || 'student',
        department: user.department,
        semester: user.semester,
        mentor_name: user.mentor_name,
        mentor_email: user.mentor_email,
        created_at: user.created_at
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.'
    });
  }
};

/**
 * Get Mentors list for signup form
 * GET /api/mentors
 */
const getMentors = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, department FROM mentors ORDER BY name ASC'
    );
    return res.status(200).json({
      success: true,
      mentors: rows
    });
  } catch (error) {
    console.error('Get mentors error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve mentors.'
    });
  }
};

module.exports = {
  signup,
  login,
  getMe,
  getMentors
};
