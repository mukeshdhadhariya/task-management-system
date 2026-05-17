## Penscience AI Task Management System

Live demo:
- Frontend: https://task-management-system-ecru.vercel.app/
- Backend API: https://task-management-system-z3s5.onrender.com/
- end point url: https://task-management-system-z3s5.onrender.com/api-docs

## Overview

Penscience AI is a full-stack task management system built with a React frontend and a Node.js/Express backend. It uses PostgreSQL with Prisma for the data layer, JWT-based authentication, role-based authorization, realtime task updates, PDF document uploads, and Docker for deployment.

The app is designed as a clean, production-oriented system with security, scalability, and maintainability in mind.

## Tech Stack

- Frontend: React, TypeScript, Vite, React Router, React Hook Form, Zod, Axios, Socket.IO Client, Tailwind CSS
- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL, JWT, Socket.IO, Multer, Cloudinary, Zod
- Infrastructure: Docker, Docker Compose, Vercel, Render

## Key Features

- Secure login and registration with JWT authentication
- HTTP-only cookie session handling
- Role-based access control for admin and user workflows
- Task CRUD with filters, pagination, and sorting
- Realtime updates for task changes via Socket.IO
- PDF document upload and download support
- Admin user management
- Swagger API documentation
- Automated Jest tests for auth, tasks, and admin user flows

## System Design

### 1. Frontend Architecture

- React pages are split by feature: dashboard, tasks, users, admin, auth, and task details.
- Reusable UI components keep the codebase consistent and easier to maintain.
- API access is centralized through small service modules.
- The app uses route protection so authenticated routes and admin routes stay isolated.
- Pagination and filter state are pushed into query params, which makes URLs shareable and prevents loading too much data at once.

### 2. Backend Architecture

- The backend is organized into routes, controllers, middlewares, services, validators, and socket handlers.
- Controllers handle request flow, middlewares enforce auth and validation, and services encapsulate external integrations such as Cloudinary.
- Prisma handles database access with typed queries and relational models.
- The backend exposes paginated list endpoints for tasks and users to keep list screens fast as the dataset grows.

### 3. Data Model

- `User`: stores email, password, role, and creation time.
- `Task`: stores title, description, status, priority, due date, and assigned user.
- `Attachment`: stores uploaded document metadata and links each file to a task.

This relational model is a better fit than a document-only design because tasks, assignees, and attachments are tightly linked.

## Security Approach

- JWT authentication with tokens stored in HTTP-only cookies
- Role-based authorization for admin-only actions
- Zod validation for request payloads
- PDF-only uploads with file size limits
- Backend-side checks before upload and before document download
- Socket authentication verifies the same identity used for API access
- Dockerized deployment reduces environment drift between local and production

## Pagination and Performance

- Task lists are paginated on the backend with `page`, `limit`, `total`, and `totalPages` metadata.
- User lists are also paginated for admin screens.
- The frontend avoids refetching user data unnecessarily and only requests bounded pages.
- Dashboard/admin views request smaller slices of data so the UI stays responsive.

## Realtime Behavior

- Task create, update, and delete events are emitted over Socket.IO.
- Connected clients receive updates instantly without manual refresh.
- This improves collaboration and keeps the UI in sync across multiple sessions.

## Document Handling

- Users can upload up to 3 PDF files per task.
- Each file is validated by MIME type and size.
- Documents are stored via Cloudinary and tracked in the database.
- Downloads are streamed through the backend so the browser receives a readable PDF response with the correct headers.

## Docker Setup

The project is fully containerized.

### Services

- PostgreSQL database
- Backend API container
- Frontend container

### Local Run with Docker

```bash
docker compose up --build
```

The compose file maps:
- Frontend to `http://localhost:3000`
- Backend to `http://localhost:5000`

During local development, the frontend should point API requests to `http://localhost:5000/api` and Socket.IO to `http://localhost:5000`.

In production, the frontend should point API requests to `https://task-management-system-z3s5.onrender.com/api` and API docs are available at `https://task-management-system-z3s5.onrender.com/api-docs`.

## Local Development

### Backend

```bash
cd backend
npm install
npm run build
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Testing

Backend automated tests are written with Jest.

- Auth tests
- Task management tests
- Admin user route tests

Run:

```bash
cd backend
npm test
```

## Deployment Notes

- Frontend is deployed on Vercel.
- Backend is deployed on Render.
- API documentation is hosted at `/api-docs` on the deployed backend.
- The app is built to work cleanly in containerized and hosted environments.
- The backend build now generates the Prisma client before TypeScript compilation, which avoids missing-client deployment failures.

## Demo Credentials

Use this test admin account for the walkthrough:

- Email: `admin@gmail.com`
- Password: `admin1234`

## What Makes This Submission Strong

- Clear layered backend structure
- Secure auth and authorization
- Real-time updates
- Pagination and performance-minded list loading
- Docker-based reproducibility
- Automated tests
- Production deployment links

## Final Note

It is a React + Node.js/Express full-stack system with PostgreSQL and Prisma, which is a stronger fit for relational task, user, and attachment data. If you want a short label, you can describe it as a modern MERN-style full-stack application with PostgreSQL instead of MongoDB.

