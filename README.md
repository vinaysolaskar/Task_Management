# Task Management

A full-stack Task Management application with a Next.js frontend and a Node.js/Express backend. Features include user authentication, task CRUD, file uploads (with Google Drive integration), rate limiting, logging, scheduled background jobs, and robust user/session security.

---

## Features

- **User Authentication**: Register, login, and role-based access (admin/user)
- **Task Management**: Create, read, update, delete tasks
- **File Uploads**: Attach files to tasks, upload to Google Drive
- **Automatic File Cleanup**: Files in Google Drive are deleted when their associated tasks are deleted (including via scheduled cleanup)
- **Rate Limiting**: Prevent abuse on sensitive endpoints
- **Logging**: Request and task logging for audit and debugging
- **Scheduled Jobs**: Automatic cleanup of old tasks and their files every week (Sunday Midnight)
- **Immediate User Logout**: If a user is deleted by an admin, they are logged out on their next action or refresh
- **API Documentation**: Swagger UI available
- **Frontend**: Built with Next.js, includes authentication and user/task management UI
- **Debounced Search & Filters**: Prevents excessive API calls
- **Responsive UI**: Works well on small screens

---

## Project Structure

```
backend/
  src/
    controllers/      # Express controllers (auth, task)
    middleware/       # Custom middleware (auth, logging, jobs, upload, etc.)
    routes/           # Express routes
    utils/            # Utility functions (Google Drive integration)
    index.js          # Express app entry point
    swagger.js        # Swagger API docs setup
  prisma/             # Prisma schema and migrations
frontend/
  components/         # React/Next.js components
  pages/              # Next.js pages (auth, users, etc.)
  src/                # App layout and config
  utils/              # Frontend utilities
```

---

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- Google Cloud project with Drive API enabled (for file uploads)
- PostgreSQL database (configured in `backend/.env`)

### Backend Setup
1. **Install dependencies:**
   ```powershell
   cd backend
   npm install
   ```
2. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your database and Google Drive credentials.
3. **Run database migrations:**
   ```powershell
   npx prisma migrate deploy
   ```
4. **Start the backend server:**
   ```powershell
   npm start
   ```
5. **API Docs:**
   - Visit `http://localhost:5000/api-docs` for Swagger UI.

### Frontend Setup
1. **Install dependencies:**
   ```powershell
   cd frontend
   npm install
   ```
2. **Configure environment variables:**
   - Copy `.env.example` to `.env` and set the backend API URL if needed.
3. **Start the frontend:**
   ```powershell
   npm run dev
   ```
4. **Visit the app:**
   - Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Usage
- Register a new user or login with existing credentials.
- Create, update, and delete tasks.
- Attach files to tasks (files are uploaded to Google Drive).
- Admin users can delete multiple users.
- Old tasks and their files are automatically deleted by a background job.
- If a user is deleted by an admin, they are logged out immediately on their next action.

---

## Environment Variables
See `.env.example` in both backend and frontend for required variables, including:
- Database connection string
- JWT secret
- Google Drive API credentials
- Allowed CORS origins

---

## Scripts
- `npm start` (backend): Start the Express server
- `npm run dev` (frontend): Start the Next.js development server
- `npx prisma migrate deploy` (backend): Run database migrations