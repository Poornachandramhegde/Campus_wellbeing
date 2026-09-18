# College ERP-Integrated Student Counselling and Well-Being System

[![React](https://img.shields.io/badge/Frontend-React%2018-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Express.js%20Node-green.svg)](https://nodejs.org/)
[![Google Calendar](https://img.shields.io/badge/Integration-Google%20Calendar%20%26%20Meet-orange.svg)](https://developers.google.com/calendar)

## 📋 Project Overview

A full-stack, privacy-aware, non-clinical counselling support and well-being system integrated into a College ERP environment. The platform allows students to request counselling sessions (Online via Google Meet or In-Person), interact with an AI-assisted well-being chatbot, and enables counsellors to manage, prioritize, and track appointments.

---

## ✨ Key Features

### 1. 🎓 Student ERP Dashboard
- Displays student details (ID, name, email, department, semester).
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
- **Backend**: Node.js, Express.js, Google APIs Client Library (`googleapis`), Nodemailer, CORS, Dotenv.
- **Persistence**: File-based transactional JSON database (`backend/data/appointments.json`).

---

## 📁 Project Structure

```
ERP_Systemforclg/
├── backend/
│   ├── config/
│   │   └── googleAuth.js          # Google OAuth2 client & token storage logic
│   ├── controllers/
│   │   └── counsellingController.js # Booking validation, DB persistence, and listing
│   ├── data/
│   │   └── appointments.json      # JSON persistence store
│   ├── routes/
│   │   └── counsellingRoutes.js   # API endpoints & OAuth callback
│   ├── services/
│   │   ├── emailService.js        # Multi-recipient email dispatch
│   │   └── googleCalendarService.js # Google Calendar event & Meet link generation
│   ├── .env                       # Backend credentials & configuration
│   ├── package.json
│   └── server.js                  # Express application entry point
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── counsellor/            # Counsellor dashboard sub-components
│   │   │   ├── CloseTicketForm.jsx
│   │   │   ├── TicketActions.jsx
│   │   │   ├── TicketCard.jsx
│   │   │   └── TicketQueue.jsx
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
│   │   └── Dashboard.jsx               # Student ERP homepage
│   ├── App.jsx                    # Routing configuration
│   ├── index.js                   # React entry point
│   └── styles.css                 # Global CSS styles
├── package.json                   # Frontend dependencies
└── README.md
```

---

## 🚀 How to Run the System Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (version 16 or higher recommended)
- `npm` (version 7 or higher)

---

### Step 1: Start the Backend Server (Port 5000)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install backend dependencies:
   ```bash
   npm install
   ```
3. Start the Express server:
   ```bash
   npm start
   ```
   *The backend will start at `http://localhost:5000`.*

---

### Step 2: Start the Frontend Application (Port 3000)

1. Open a **second terminal** in the root directory (`ERP_Systemforclg`):
   ```bash
   npm install
   ```
2. Start the React development server:
   ```bash
   npm start
   ```
3. The application will open automatically in your browser at:
   👉 **`http://localhost:3000`**

---

## ☁️ Running on Google Colab

You can run both the Backend and Frontend servers inside a **Google Colab** environment and expose them via public tunnels.

### Colab Execution Steps

Create a new notebook in Google Colab and run the following cells:

#### Cell 1: Clone or Upload Repository & Install Node.js
```python
# 1. Install Node.js LTS (v18.x)
!curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
!apt-get install -y nodejs

# 2. Check Node & npm versions
!node -v
!npm -v
```

#### Cell 2: Install Project Dependencies
```python
# Install frontend dependencies
!npm install

# Install backend dependencies
%cd backend
!npm install
%cd ..
```

#### Cell 3: Start Backend & Frontend in Background
```python
import subprocess
import time

# Start Backend Server on Port 5000
backend_proc = subprocess.Popen(["node", "server.js"], cwd="backend")
print("Backend process started on port 5000.")

# Start Frontend React App on Port 3000
frontend_proc = subprocess.Popen(["npm", "start"], cwd=".")
print("Frontend process starting on port 3000 (Give it ~20-30 seconds to compile)...")
time.sleep(15)
```

#### Cell 4: Expose Ports Using Cloudflared or Localtunnel
```python
# Option A: Expose Frontend using LocalTunnel
!npx localtunnel --port 3000 & curl https://loca.lt/mytunnelpassword
```
*Click the generated URL and paste the IP password to access your ERP application.*

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

| Route | Description |
| :--- | :--- |
| **`http://localhost:3000/`** | **Student ERP Dashboard**: View student profile, mentor/counsellor info, and chatbot. |
| **`http://localhost:3000/counselling-booking`** | **Booking Page**: Submit Offline or Online counselling requests. |
| **`http://localhost:3000/counsellor-dashboard`** | **Counsellor Portal**: Manage ticket queues, change statuses, and access Meet links. |
| **`http://localhost:5000/health`** | **Backend Health Check**: Confirms backend is running. |
| **`http://localhost:5000/api/auth/google`** | **OAuth Trigger**: Initiates Google Calendar/Meet permission consent. |

---

## 🔒 Ethical & Privacy Notice

This application is built for academic research and prototype validation:
- **Non-Clinical Design**: Intended for academic and well-being guidance, not clinical psychiatric emergencies.
- **Privacy Awareness**: Student consultation reasons and requests are handled respectfully with priority classification.

---

## 📄 License
Academic and Educational Research Prototype.
