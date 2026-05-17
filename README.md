# College ERP-Integrated Student Counselling and Well-Being System

## 📋 Project Overview

This is a React-based frontend functional prototype for a college ERP-integrated student counselling and well-being system. The system is designed as a non-clinical, privacy-aware counselling support module that enables students to request counselling sessions and allows counsellors to manage requests through a structured, priority-based workflow.

This prototype serves as a demonstration tool for:
- Academic research validation
- UX/workflow validation
- System feasibility proof

## 🎯 Objectives

1. **Demonstrate Integration**: Show how emotional and spiritual well-being support can be embedded into a college ERP system
2. **Workflow Validation**: Validate the structured, priority-based counselling request workflow
3. **Ethical Design**: Implement non-clinical language and privacy-aware design principles
4. **User Experience**: Create an intuitive, professional interface aligned with ERP systems

## ✨ Features

### 1. Student ERP Dashboard
- **Student Profile Display**: Shows student information including ID, name, email, department, year, and semester
- **Academic Mentor Section**: Displays assigned mentor details (name, email, phone, department)
- **Student Counsellor Section**: Shows assigned counsellor information with office hours
- **Privacy Notice**: Includes confidentiality reminder
- **Navigation**: "Book Counselling Slot" button to access booking module

### 2. Counselling Booking Module
- **Booking Form** with the following fields:
  - Preferred Date (date picker)
  - Preferred Time (time picker)
  - Reason for Counselling (textarea)
  - Priority Selector (High / Medium / Low)
- **Form Validation**: Required field validation
- **Submission Process**:
  - Generates unique mock ticket ID
  - Displays ticket status as "Submitted"
  - Shows SLA (Service Level Agreement) based on priority:
    - **High**: Within 24 hours
    - **Medium**: 2–3 working days
    - **Low**: Within 7 working days
- **Confirmation Screen**: Displays request summary and next steps

### 3. Ethical & UX Requirements
- ✅ Non-clinical language throughout
- ✅ Privacy notice on all relevant screens
- ✅ No personal or sensitive data storage
- ✅ No diagnosis, therapy, or medical terminology
- ✅ Professional, calm, ERP-style design

## 🛠️ Tech Stack

- **React 18.2.0**: Functional components with hooks
- **React Router DOM 6.8.0**: Client-side routing
- **React Scripts 5.0.1**: Build tooling and development server
- **CSS3**: Custom styling for ERP-style, professional interface

### Design Principles
- Functional components only
- React useState for state management (no Redux)
- No backend or API calls
- Simple, readable, modular code structure
- Minimal, professional styling

## 📁 Folder Structure

```
ERP_Systemforclg/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── CounsellorCard.jsx      # Displays counsellor information
│   │   ├── BookingForm.jsx          # Counselling request form
│   │   └── ConfirmationCard.jsx    # Post-submission confirmation
│   ├── pages/
│   │   ├── Dashboard.jsx            # Main student dashboard
│   │   └── CounsellingBooking.jsx  # Booking page with form
│   ├── App.jsx                      # Main app component with routing
│   ├── index.js                     # Application entry point
│   └── styles.css                   # Global styles
├── package.json
└── README.md
```

## 🚀 How to Run the Project

### Prerequisites
- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Access the Application**
   - The application will automatically open in your browser at `http://localhost:3000`
   - If it doesn't open automatically, navigate to the URL manually

### Available Scripts

- `npm start`: Runs the app in development mode
- `npm build`: Builds the app for production
- `npm test`: Launches the test runner
- `npm eject`: Ejects from Create React App (irreversible)

## 🔒 Ethical Disclaimer

This is a **frontend-only prototype** designed for academic research and demonstration purposes. Important considerations:

1. **No Data Storage**: This prototype does not store any personal or sensitive data. All form submissions are handled in-memory only.

2. **Non-Clinical System**: This system is designed for non-clinical support and does not provide:
   - Medical diagnosis
   - Therapy services
   - Clinical mental health treatment
   - Emergency crisis intervention

3. **Privacy**: While this prototype includes privacy notices, it does not implement actual data encryption or secure storage. In a production system, all data would need to comply with:
   - FERPA (Family Educational Rights and Privacy Act)
   - HIPAA (if applicable)
   - Institutional privacy policies

4. **Not for Production Use**: This prototype is intended for:
   - Academic research
   - UX/workflow validation
   - System feasibility demonstration
   - **NOT for actual student counselling services**

5. **Professional Responsibility**: In a real implementation, the system would require:
   - Licensed mental health professionals
   - Proper crisis intervention protocols
   - Secure data storage and encryption
   - Compliance with institutional and legal requirements

## 🔮 Future Scope

### Immediate Enhancements
- [ ] Add request status tracking (Pending, Approved, Scheduled, Completed)
- [ ] Implement counsellor dashboard for managing requests
- [ ] Add email notification simulation
- [ ] Include session history view

### Integration Features
- [ ] Backend API integration
- [ ] Database connectivity
- [ ] Authentication and authorization
- [ ] Real-time notifications
- [ ] Calendar integration for scheduling

### Advanced Features
- [ ] Multi-counsellor assignment
- [ ] Resource library (articles, videos, self-help materials)
- [ ] Anonymous request option
- [ ] Feedback and rating system
- [ ] Analytics dashboard for administrators

### Production Considerations
- [ ] Security hardening
- [ ] Data encryption
- [ ] Audit logging
- [ ] Compliance with FERPA/HIPAA
- [ ] Mobile responsive optimization
- [ ] Accessibility (WCAG 2.1 compliance)

## 📚 Academic Context

This prototype was developed to demonstrate how well-being support systems can be integrated into existing college ERP infrastructure. The design emphasizes:

- **Institutional Alignment**: Workflow and design patterns match typical ERP systems
- **Ethical Considerations**: Non-clinical language, privacy awareness, and appropriate scope
- **Scalability**: Modular architecture allows for future expansion
- **User-Centered Design**: Focus on student experience and ease of use

### Research Applications
- Human-computer interaction studies
- Educational technology research
- Mental health support system design
- ERP integration patterns
- Privacy-aware system design

## 👥 Target Users

- **Primary**: College students seeking counselling support
- **Secondary**: Student counsellors and mental health professionals
- **Tertiary**: Academic administrators and researchers

## 📝 Notes

- All data in this prototype is mock data
- Ticket IDs are generated using timestamp and random number
- No actual backend communication occurs
- All routing is client-side only
- Styling follows ERP design patterns (professional, calm, minimal)

## 📄 License

This project is created for academic research and demonstration purposes.

---

**Developed for Academic Research | Frontend Prototype Only | Not for Production Use**

