-- ==========================================================
-- College ERP-Integrated Student Counselling & Well-Being System
-- Safe Development & Demo Seed Data
-- ==========================================================
-- NOTE: This file contains ONLY mock, development-safe records.
-- No real student data, sensitive counselling records, or production secrets.
-- ==========================================================

USE erp_wellbeing;

-- ----------------------------------------------------------
-- 1. Seed Counsellors
-- ----------------------------------------------------------
INSERT INTO counsellors (id, name, email, department, specialization, phone, created_at)
VALUES 
  (1, 'Dr. Leena C', 'leenac@rnsit.ac.in', 'Student Well-Being Cell', 'Student Well-Being & Academic Guidance', '+91 80 2861 1880', NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  department = VALUES(department),
  specialization = VALUES(specialization),
  phone = VALUES(phone);

-- ----------------------------------------------------------
-- 2. Seed Mentors (Populates Signup Mentor Dropdown)
-- ----------------------------------------------------------
INSERT INTO mentors (id, name, email, department, phone, created_at)
VALUES 
  (1, 'Dr. Archana J R', 'archanajr@rnsitmba.ac.in', 'MBA', '+91 80 2861 1881', NOW()),
  (2, 'Dr. Sudhir Rao', 'sudhir.rao@rnsit.ac.in', 'Computer Science & Engineering', '+91 80 2861 1882', NOW()),
  (3, 'Prof. Kavitha M', 'kavitha.m@rnsit.ac.in', 'Information Science & Engineering', '+91 80 2861 1883', NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  email = VALUES(email),
  department = VALUES(department),
  phone = VALUES(phone);

-- ----------------------------------------------------------
-- 3. Seed Demo Student User
-- Credentials:
--   Email:    student@demo.local
--   Password: password123
-- (Bcrypt hash: $2b$10$sca///a.B8Vmr7d7zAwxauzhHie9PDsfrUYcSmP6HhrqxSi2aBSNK)
-- Developers can also create fresh accounts directly via the /signup page.
-- ----------------------------------------------------------
INSERT INTO users (id, name, usn, email, password_hash, role, department, semester, mentor_name, mentor_email, created_at)
VALUES 
  (1, 'Demo Student', '1RN24CS001', 'student@demo.local', NULL, 'student', 'Computer Science and Engineering', 3, 'Dr. Archana J R', 'archanajr@rnsitmba.ac.in', NOW())
ON DUPLICATE KEY UPDATE
  name = VALUES(name),
  usn = VALUES(usn),
  department = VALUES(department),
  semester = VALUES(semester),
  mentor_name = VALUES(mentor_name),
  mentor_email = VALUES(mentor_email);

INSERT INTO user_login (id, user_id, email, password_hash, is_active, last_login, created_at)
VALUES 
  (1, 1, 'student@demo.local', '$2b$10$sca///a.B8Vmr7d7zAwxauzhHie9PDsfrUYcSmP6HhrqxSi2aBSNK', 1, NULL, NOW())
ON DUPLICATE KEY UPDATE
  user_id = VALUES(user_id),
  password_hash = VALUES(password_hash),
  is_active = VALUES(is_active);
