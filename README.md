# FestManager 🚀

FestManager is a sleek, modern web application built with React and Node.js designed to make college event and fest management an absolute breeze. With a custom vibrant glassmorphic UI, it provides a seamless experience for both organizers and students.

## Features ✨
- **Dual Personas:** Separate dashboards and functionalities for Admins (Organizers) and Students (Participants).
- **Propose & Manage Stalls:** Students can propose stall ideas by selecting themes. Admins can review and approve or reject them.
- **Dynamic Event Scheduling:** Admins can create events, set participant capacity limits, and edit events on the fly without page reloads.
- **Capacity Limits:** Students can join events until the capacity is reached. The system prevents overbooking automatically.
- **Vibrant UI:** Custom light theme with frosted glass cards (glassmorphism) and beautiful radial gradient glows.

## Tech Stack 🛠️
- **Frontend:** React (Vite)
- **Backend:** Node.js, Express.js
- **Database:** SQLite (better-sqlite3)
- **Authentication:** JWT & bcrypt

## Getting Started 🏁

### Prerequisites
- Node.js (v18+ recommended)
- npm

### 1. Clone the repository
```bash
git clone https://github.com/pavanganesh03/Fest_Manager.git
cd Fest_Manager
```

### 2. Set up the Backend
```bash
cd backend
npm install
node server.js
```
*The backend will run on `http://localhost:3000` and automatically initialize the SQLite database.*

### 3. Set up the Frontend
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The frontend will run on `http://localhost:5173`.*

### Default Admin Account
To test the admin features, use the default credentials:
- **Email:** `admin@fest.com`
- **Password:** `admin123`

## License 📄
This project is licensed under the MIT License.
