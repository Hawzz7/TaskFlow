# TaskFlow

TaskFlow is a full-stack project and task management application built with the MERN stack.

It provides secure authentication, project management, task management, role-based access control, and a dedicated admin panel for monitoring users, projects, and tasks.

---

## Features

### Authentication & Authorization

- User registration and login
- JWT-based authentication
- Access token and refresh token architecture
- HTTP-only authentication cookies
- Protected routes
- Automatic authentication initialization
- Logout functionality
- Role-based authorization
- `USER` and `ADMIN` roles
- Dedicated admin routes protected on both frontend and backend

### User Dashboard

Authenticated users can:

- View their dashboard
- View their projects
- Create projects
- Edit projects
- View project details
- Add members to projects
- Create tasks
- Edit tasks
- Assign tasks to project members
- Track task status
- Set task priority
- Set task due dates
- View tasks associated with their projects

### Admin Panel

Administrators have access to a dedicated admin panel.

The admin dashboard provides:

- Total users
- Total projects
- Total tasks
- Recent users
- Recent projects
- Recent tasks
- Complete users management page
- Complete projects overview
- Complete tasks overview
- Admin-only protected routes
- Admin logout

Admin authorization is enforced on the backend using authentication and admin middleware.

---

## Tech Stack

### Frontend

- React
- Vite
- React Router DOM
- Redux Toolkit
- React Redux
- Tailwind CSS
- Motion
- Axios
- React Hook Form
- Zod
- Lucide React

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcrypt
- cookie-parser
- CORS

### Development Tools

- Git
- GitHub
- Postman
- VS Code
- Nodemon

---

## Architecture

TaskFlow follows a separate frontend/backend architecture.

```text
TaskFlow
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── redux/
│       │   ├── slices/
│       │   └── store.js
│       ├── services/
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Backend Structure

The backend follows a modular Express architecture.

```text
server/src/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── projectController.js
│   └── taskController.js
│
├── middleware/
│   ├── adminMiddleware.js
│   └── authMiddleware.js
│
├── models/
│   ├── User.model.js
│   ├── Project.model.js
│   └── Task.model.js
│
├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── projectRoutes.js
│   └── taskRoutes.js
│
├── utils/
│   ├── cookieUtils.js
│   └── tokenUtils.js
│
└── server.js
```

---

## Frontend Structure

```text
client/src/
│
├── components/
│   ├── AdminRoute.jsx
│   ├── AuthInitializer.jsx
│   ├── ProtectedRoute.jsx
│   ├── PublicRoute.jsx
│   ├── CreateProjectModal.jsx
│   ├── EditProjectModal.jsx
│   ├── CreateTaskModal.jsx
│   ├── EditTaskModal.jsx
│   └── AddProjectMemberModal.jsx
│
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── Project.jsx
│   ├── ProjectDetails.jsx
│   ├── AdminDashboard.jsx
│   └── admin/
│       ├── AdminUsers.jsx
│       ├── AdminProjects.jsx
│       └── AdminTasks.jsx
│
├── redux/
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── projectSlice.js
│   │   ├── taskSlice.js
│   │   └── adminSlice.js
│   │
│   └── store.js
│
├── services/
│   ├── api.js
│   ├── authServices.js
│   ├── projectServices.js
│   ├── taskServices.js
│   └── adminServices.js
│
├── App.jsx
├── index.css
└── main.jsx
```

---

# Authentication Flow

TaskFlow uses an access-token and refresh-token architecture.

```text
User
 │
 ▼
Login / Register
 │
 ▼
Backend validates credentials
 │
 ▼
Generate Access Token
Generate Refresh Token
 │
 ▼
HTTP-only Cookies
 │
 ▼
Authenticated API Requests
```

The access token is used for authenticated requests.

When the access token expires, the refresh token can be used to obtain a new access token.

The authentication middleware validates the access token and attaches the authenticated user to:

```javascript
req.user
```

---

# Role-Based Access Control

TaskFlow supports two roles:

```text
USER
ADMIN
```

Normal users can access the regular project and task management functionality.

Administrators can access the admin panel.

Backend authorization follows the pattern:

```text
protect
   ↓
isAdmin
   ↓
Admin Controller
```

This ensures that admin access is not dependent only on frontend route protection.

Frontend admin routes are also protected using:

```text
AdminRoute
```

---

# Database Models

TaskFlow currently uses three main MongoDB models.

### User

Stores:

- Name
- Email
- Password
- Role
- Created date
- Updated date

Roles:

```text
USER
ADMIN
```

### Project

Stores project information including:

- Project name
- Description
- Status
- Priority
- Owner
- Members
- Dates

### Task

Stores task information including:

- Task title
- Description
- Project
- Assignee
- Status
- Priority
- Due date
- Dates

---

# API Overview

## Authentication

```text
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
```

## Projects

Project endpoints are protected using authentication middleware.

```text
/api/projects
```

Users can create, view, update, and manage projects according to the application's authorization rules.

## Tasks

Task endpoints are protected using authentication middleware.

```text
/api/tasks
```

Users can create, update, assign, and manage tasks associated with their projects.

## Admin

Admin endpoints require both authentication and admin authorization.

```text
/api/admin
```

Admin functionality includes:

```text
GET    /api/admin/stats
GET    /api/admin/users
GET    /api/admin/projects
GET    /api/admin/tasks
```

---

# Environment Variables

Environment variables are intentionally excluded from Git.

Create the required `.env` files locally.

## Server Environment Variables

Create:

```text
server/.env
```

Example:

```env
PORT=7000

MONGODB_URI=your_mongodb_connection_string

ACCESS_TOKEN_SECRET=your_access_token_secret

REFRESH_TOKEN_SECRET=your_refresh_token_secret

NODE_ENV=development
```

> Use the exact MongoDB environment variable name configured in `server/src/config/db.js` if your local implementation uses a different name.

---

## Client Environment Variables

Create:

```text
client/.env
```

Example:

```env
VITE_API_URL=http://localhost:7000/api
```

> If your Axios configuration uses a different Vite variable name, use that variable name instead.

---

# Environment File Security

Never commit real environment files to GitHub.

The following files should remain local:

```text
client/.env
server/.env
```

Never expose:

- MongoDB credentials
- JWT secrets
- API keys
- Database connection strings containing credentials
- Production secrets

A safe repository should contain example configuration rather than real credentials.

---

# Installation

## 1. Clone the repository

```bash
git clone <your-github-repository-url>
```

Then:

```bash
cd TaskFlow
```

---

## 2. Install frontend dependencies

```bash
cd client
npm install
```

---

## 3. Install backend dependencies

Open another terminal and run:

```bash
cd server
npm install
```

---

# Local Development

## Start the backend

From the `server` directory:

```bash
npm run dev
```

The backend will start on the configured `PORT`.

---

## Start the frontend

From the `client` directory:

```bash
npm run dev
```

Vite will start the frontend development server.

---

# Running the Application

After starting both applications:

```text
Frontend
   │
   │ HTTP requests
   ▼
Express API
   │
   ▼
MongoDB
```

The frontend communicates with the Express backend through REST APIs.

Authentication credentials are handled using HTTP-only cookies.

---

# Admin Account

For security, public registration creates a normal user by default.

```text
New Registration
       ↓
     USER
```

An administrator can then be provisioned separately by assigning the `ADMIN` role to a trusted account in the database.

```text
USER
 ↓
ADMIN
```

Admin routes are protected by backend authorization middleware.

For production deployments, administrator provisioning should be handled through a controlled process rather than exposing an unrestricted public admin-registration endpoint.

---

# Security

TaskFlow implements several security measures:

- Password hashing using bcrypt
- JWT authentication
- HTTP-only cookies
- Protected backend routes
- Role-based authorization
- Admin-only backend endpoints
- Frontend protected routes
- Environment variables for secrets
- Environment files excluded from Git
- Input validation using Zod on the frontend

---

# Git Ignore

The repository excludes sensitive and generated files including:

```text
.env
.env.*
node_modules/
dist/
build/
.vite/
*.log
```

---

# Future Improvements

Potential future features include:

- Notification system
- Email notifications
- Task due-date reminders
- Real-time notifications
- Activity/audit logs
- Advanced task filtering
- Project analytics
- Pagination
- Search
- File attachments
- Deployment monitoring

---

# Future Notification System

A notification system is planned for TaskFlow.

Potential notification events include:

- User added to a project
- Task assigned to a user
- Task marked as completed
- Task approaching its due date

Users will eventually be able to:

- View notifications
- Mark individual notifications as read
- Mark all notifications as read

---

# Project Status

TaskFlow currently includes:

- Authentication
- JWT access/refresh token flow
- User dashboard
- Project management
- Task management
- Task assignment
- Role-based access control
- Admin dashboard
- Admin user management
- Admin project management
- Admin task management

The notification system is planned for a future iteration.

---

# Author

**Narendra Kumar Majhi**

Full Stack Developer

Built with React, Node.js, Express.js, MongoDB, and modern JavaScript technologies.
