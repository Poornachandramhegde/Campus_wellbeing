# College ERP-Integrated Student Counselling and Well-Being System

[![React](https://img.shields.io/badge/Frontend-React%2018-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Express.js%20Node-green.svg)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MySQL%208.0-blue.svg)](https://www.mysql.com/)
[![Google Calendar](https://img.shields.io/badge/Integration-Google%20Calendar%20%26%20Meet-orange.svg)](https://developers.google.com/calendar)

## 📋 Project Overview

A full-stack, privacy-aware, non-clinical counselling support and well-being system integrated into a College ERP environment. The platform allows students to request counselling sessions (Online via Google Meet or In-Person), interact with an AI-assisted well-being chatbot, and enables counsellors to manage, prioritize, and track appointments.

---

## ✨ Key Features

### 1. 🎓 Student ERP Dashboard

- Displays student details (USN, name, email, department, semester).
- Assigned **Academic Mentor** and **Student Counsellor** contact cards with office hours.
- Integrated **Well-Being & Booking Chatbot Widget**.
- Navigation to session booking and ticket status tracking.

### 2. 📅 Dual-Mode Counselling Booking Module

- **Offline / In-Person Mode**: Books physical office appointments and sends automated notification emails.
- **Online Mode**: Integrates directly with **Google Calendar API** to auto-generate a **Google Meet video link** and add the meeting to the calendar with email invites.
- **Priority-Based SLA Tracking**:
  - 🔴 **High Priority**: Response within 24 hours
  - 🟡 **Medium Priority**: Response within 2–3 working days
  - 🟢 **Low Priority**: Response within 7 working days

### 3. 💬 Interactive Chatbot Widget

- Responsive floating chatbot on the student dashboard.
- Provides emotional well-being advice, FAQs, and step-by-step guided booking directly inside the chat interface.

### 4. 👨‍🏫 Counsellor Management Dashboard (`/counsellor-dashboard`)

- Real-time queue of submitted counselling requests.
- Filter tickets by priority (High, Medium, Low) and status (Submitted, In Progress, Scheduled, Completed, Closed).
- Direct access to join generated Google Meet links.
- Session closure notes and status updater.

### 5. 📧 Email Dispatch System

- Automated transactional emails to **Student**, **Counsellor**, and **Academic Mentor** using Nodemailer.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, React Router DOM v6, Vanilla CSS3 (ERP Theme Design System).
- **Backend**: Node.js, Express.js, Google APIs Client Library (`googleapis`), Nodemailer, CORS, Dotenv, JSONWebToken, BcryptJS.
- **Database**: MySQL 8.0 (`mysql2` connection pool with promises).

---

## 📁 Project Structure

```
ERP_Systemforclg/
├── backend/
│   ├── config/
│   │   ├── db.js                  # MySQL connection pool configuration
│   │   └── googleAuth.js          # Google OAuth2 client & token storage logic
│   ├── controllers/
│   │   ├── authController.js      # Student signup, login, profile, and mentors list
│   │   ├── counsellingController.js # Session booking, conflict checks, and queue
│   │   └── userController.js      # User management endpoint
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification middleware
│   ├── routes/
│   │   ├── authRoutes.js          # Authentication & mentor routes
│   │   ├── counsellingRoutes.js   # Counselling API endpoints & OAuth callback
│   │   └── userRoutes.js          # User API routes
│   ├── services/
│   │   ├── emailService.js        # Multi-recipient transactional email dispatch
│   │   └── googleCalendarService.js # Google Calendar event & Meet link generation
│   ├── .env.example               # Environment variables template (placeholders only)
│   ├── package.json
│   └── server.js                  # Express application entry point
├── database/
│   ├── schema.sql                 # MySQL schema definition (DDL for tables & keys)
│   └── seed.sql                   # Safe demo seed data (counsellor, mentors, demo student)
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── counsellor/            # Counsellor dashboard sub-components
│   │   ├── BookingForm.jsx        # Session booking form
│   │   ├── ChatbotWidget.jsx      # Well-being chatbot widget
│   │   ├── ConfirmationCard.jsx   # Post-booking confirmation screen
│   │   └── CounsellorCard.jsx     # Counsellor details card
│   ├── context/
│   │   └── TicketContext.jsx      # Global React Context for tickets and user state
│   ├── pages/
│   │   ├── counsellor/
│   │   │   └── CounsellorDashboard.jsx # Counsellor review interface
│   │   ├── CounsellingBooking.jsx      # Student booking page
│   │   ├── Dashboard.jsx               # Student ERP homepage
│   │   ├── Login.jsx                   # Student login page
│   │   └── Signup.jsx                  # Student signup page
│   ├── App.jsx                    # Routing configuration
│   ├── index.js                   # React entry point
│   └── styles.css                 # Global CSS styles
├── .gitignore                     # Git ignore rules protecting local secrets
├── package.json                   # Frontend dependencies
└── README.md
```

---

## 🗄️ LOCAL DATABASE SETUP

### Database Architecture & Portability

- The application uses **MySQL 8.0**.
- Each developer runs their own independent local MySQL server.
- The GitHub repository contains the schema definition ([`database/schema.sql`](database/schema.sql)) and safe demo seed data ([`database/seed.sql`](database/seed.sql)).
- The actual database itself is **NOT** stored in GitHub.
- Database passwords, OAuth tokens, and SMTP credentials remain strictly on each developer's local computer.
- In `backend/.env`, `DB_HOST=localhost` refers to the MySQL instance running on **THAT developer's own local computer**.

---

### Step-by-Step Local Setup Flow

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd ERP_Systemforclg
   ```

2. **Install Node.js dependencies**:

   ```bash
   # Install frontend dependencies
   npm install

   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Install and start MySQL 8.0**:
   - Ensure the MySQL 8.0 service is running on your machine (default port `3306`).

4. **Open MySQL Workbench (or MySQL CLI)**:
   - Connect to your local MySQL root instance.

5. **Run the Schema script**:
   - Execute [`database/schema.sql`](database/schema.sql) in MySQL Workbench or run:
     ```bash
     mysql -u root -p < database/schema.sql
     ```
   - This creates the `erp_wellbeing` database and the 6 required tables: `users`, `user_login`, `counsellors`, `mentors`, `appointments`, `counselling_notes`.

6. **Run the Seed script**:
   - Execute [`database/seed.sql`](database/seed.sql) in MySQL Workbench or run:
     ```bash
     mysql -u root -p erp_wellbeing < database/seed.sql
     ```
   - This populates demo records for counsellor (`Dr. Leena C`), mentors (`Dr. Archana J R`, etc.), and a demo student (`student@demo.local` / `password123`).

7. **Copy Environment Template**:

   ```bash
   # From root or backend folder
   cp backend/.env.example backend/.env
   ```

8. **Enter your local MySQL credentials in `backend/.env`**:

   ```env
   PORT=5000
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=YOUR_LOCAL_MYSQL_PASSWORD
   DB_NAME=erp_wellbeing
   JWT_SECRET=your_local_secret_key_change_me
   JWT_EXPIRES_IN=1d
   ```

9. **(Optional) Configure Google OAuth locally**:
   - If Google Calendar and Meet links are needed for online booking, add your Google Cloud OAuth Client credentials to `backend/.env`:
     ```env
     GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
     GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
     GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
     ```
   - _Note: OAuth credentials and generated `oauth.json` tokens are developer-specific and must never be committed._

10. **(Optional) Configure SMTP locally**:
    - If automated transactional email notifications are needed, configure your SMTP credentials in `backend/.env`:
      ```env
      SMTP_HOST=smtp.gmail.com
      SMTP_PORT=465
      SMTP_SECURE=true
      SMTP_USER=YOUR_SMTP_EMAIL@gmail.com
      SMTP_PASSWORD=YOUR_SMTP_APP_PASSWORD
      ```
    - _Note: SMTP credentials are developer-specific and must never be committed._

11. **Start the backend server**:

    ```bash
    cd backend
    npm start
    ```

    _The backend server will start on `http://localhost:5000`._

12. **Start the frontend application**:
    - Open a second terminal in the project root:
      ```bash
      npm start
      ```
    - The application opens at **`http://localhost:3000`**.

---

## 🔑 Google Calendar & Meet OAuth Setup

To enable real Google Meet link generation for online sessions:

1. Start your backend server.
2. Open your browser and navigate to:
   👉 **`http://localhost:5000/api/auth/google`**
3. Sign in with your Google Account and click **Continue / Allow**.
4. You will see a green success page: `✓ Google OAuth Authentication Successful`.
5. Authentication tokens are securely saved to `backend/oauth.json`.

### ⚠️ Troubleshooting `invalid_grant` / Expired Token Error

If you see the error `GaxiosError: invalid_grant - Token has been expired or revoked`:

1. Visit **`http://localhost:5000/api/auth/google`** in your browser.
2. Complete the Google authorization again to obtain a fresh token.
3. Restart the backend server (`Ctrl + C` and `npm start`).

---

## 🌐 Application Routes

| Route                                            | Description                                                                                      |
| :----------------------------------------------- | :----------------------------------------------------------------------------------------------- |
| **`http://localhost:3000/login`**                | **Student Login**: Sign in with email and password (demo: `student@demo.local` / `password123`). |
| **`http://localhost:3000/signup`**               | **Student Registration**: Create a new account with mentor assignment.                           |
| **`http://localhost:3000/`**                     | **Student ERP Dashboard**: View student profile, mentor/counsellor info, and chatbot.            |
| **`http://localhost:3000/counselling-booking`**  | **Booking Page**: Submit Offline or Online counselling requests.                                 |
| **`http://localhost:3000/counsellor-dashboard`** | **Counsellor Portal**: Manage ticket queues, change statuses, and access Meet links.             |
| **`http://localhost:5000/health`**               | **Backend Health Check**: Confirms backend is running.                                           |
| **`http://localhost:5000/api/auth/google`**      | **OAuth Trigger**: Initiates Google Calendar/Meet permission consent.                            |

---

## 🔒 Ethical & Privacy Notice

This application is built for academic research and prototype validation:

- **Non-Clinical Design**: Intended for academic and well-being guidance, not clinical psychiatric emergencies.
- **Privacy Awareness**: Student consultation reasons and requests are handled respectfully with priority classification.

---

## 📄 License

Academic and Educational Research Prototype.

# Campus-wellbeing

erp portal
