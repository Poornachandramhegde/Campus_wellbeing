-- ==========================================================
-- College ERP-Integrated Student Counselling & Well-Being System
-- Database Schema Definition (MySQL 8.0+)
-- Database: erp_wellbeing
-- ==========================================================

CREATE DATABASE IF NOT EXISTS erp_wellbeing;
USE erp_wellbeing;

-- ----------------------------------------------------------
-- 1. Table: users
-- Stores core student, faculty, and administrator profiles
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  usn VARCHAR(50) UNIQUE NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NULL,
  role ENUM('student', 'counsellor', 'mentor', 'admin') NOT NULL DEFAULT 'student',
  department VARCHAR(100) NULL,
  semester INT NULL,
  mentor_name VARCHAR(255) NULL,
  mentor_email VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 2. Table: user_login
-- Stores authentication credentials, active status, and audit timestamps
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS user_login (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  last_login TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_user_login_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 3. Table: counsellors
-- Stores profiles of designated student counsellors
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS counsellors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(100) NULL,
  specialization VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 4. Table: mentors
-- Stores academic mentors available for assignment to students
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS mentors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(100) NULL,
  phone VARCHAR(50) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 5. Table: appointments
-- Stores offline and online counselling session booking records
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  counsellor_id INT NULL,
  mode ENUM('online', 'offline') NOT NULL DEFAULT 'offline',
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT NOT NULL,
  priority ENUM('High', 'Medium', 'Low') NOT NULL DEFAULT 'Medium',
  status VARCHAR(50) NOT NULL DEFAULT 'confirmed',
  meeting_link VARCHAR(500) NULL,
  calendar_event_id VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointments_student FOREIGN KEY (student_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT fk_appointments_counsellor FOREIGN KEY (counsellor_id) REFERENCES counsellors (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ----------------------------------------------------------
-- 6. Table: counselling_notes
-- Stores counsellor feedback, session notes, and guidance history
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS counselling_notes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  appointment_id INT NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_notes_appointment FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
