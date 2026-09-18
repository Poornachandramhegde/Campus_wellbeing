import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    usn: '',
    email: '',
    password: '',
    confirmPassword: '',
    department: 'Computer Science and Engineering',
    semester: '3',
    mentor_id: ''
  });

  const [mentorsList, setMentorsList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Fetch available mentors for dropdown
  useEffect(() => {
    const fetchMentors = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/mentors');
        if (response.ok) {
          const data = await response.json();
          if (data.success && Array.isArray(data.mentors)) {
            setMentorsList(data.mentors);
            if (data.mentors.length > 0) {
              setFormData((prev) => ({
                ...prev,
                mentor_id: data.mentors[0].id
              }));
            }
          }
        }
      } catch (err) {
        console.warn('Could not load mentors from backend, using fallback list');
      }
    };

    fetchMentors();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Form Validations
    if (!formData.name.trim() || !formData.usn.trim() || !formData.email.trim() || !formData.password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (formData.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify.');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        name: formData.name.trim(),
        usn: formData.usn.trim().toUpperCase(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        department: formData.department,
        semester: formData.semester,
        mentor_id: formData.mentor_id ? parseInt(formData.mentor_id, 10) : null
      };

      const result = await signup(payload);
      setSuccessMessage(result.message || 'Registration successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 1500);
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card signup-card">
        <div className="auth-header">
          <div className="auth-logo-badge">🎓</div>
          <h1>Create Student Account</h1>
          <p className="auth-subtitle">Register for ERP Student Counselling & Well-Being Portal</p>
        </div>

        {errorMessage && (
          <div className="auth-alert auth-alert-error">
            <span>⚠️</span>
            <div>{errorMessage}</div>
          </div>
        )}

        {successMessage && (
          <div className="auth-alert auth-alert-success">
            <span>✓</span>
            <div>{successMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="e.g. Poornachandra Hegde"
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="usn">USN (University Seat Number) *</label>
              <input
                type="text"
                id="usn"
                name="usn"
                placeholder="e.g. 1RN24CS024"
                value={formData.usn}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email">College Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="e.g. student@rnsit.ac.in"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="department">Department</label>
              <select
                id="department"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="Computer Science and Engineering">Computer Science & Engineering</option>
                <option value="Information Science and Engineering">Information Science & Engineering</option>
                <option value="Electronics and Communication Engineering">Electronics & Communication</option>
                <option value="Artificial Intelligence & Machine Learning">AI & Machine Learning</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Master of Business Administration">Master of Business Administration (MBA)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="semester">Semester</label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                disabled={isLoading}
              >
                <option value="1">1st Semester (Year 1)</option>
                <option value="2">2nd Semester (Year 1)</option>
                <option value="3">3rd Semester (Year 2)</option>
                <option value="4">4th Semester (Year 2)</option>
                <option value="5">5th Semester (Year 3)</option>
                <option value="6">6th Semester (Year 3)</option>
                <option value="7">7th Semester (Year 4)</option>
                <option value="8">8th Semester (Year 4)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="mentor_id">Assigned Academic Mentor</label>
            <select
              id="mentor_id"
              name="mentor_id"
              value={formData.mentor_id}
              onChange={handleChange}
              disabled={isLoading}
            >
              {mentorsList.length > 0 ? (
                mentorsList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.department || 'Faculty Mentor'}) - {m.email}
                  </option>
                ))
              ) : (
                <option value="1">Dr. Archana J R (MBA) - archanajr@rnsitmba.ac.in</option>
              )}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large auth-submit-btn"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Complete Registration'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to="/login" className="auth-link">
              Sign In here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
