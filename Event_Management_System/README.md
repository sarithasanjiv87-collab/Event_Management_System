# Event Management System

Full-stack starter project using React + Vite, Node.js + Express, and MySQL.

## Features
- User registration and login (JWT)
- Browse events
- Create, edit, and delete events (organizer/admin API)
- Book an event and view your bookings
- Basic responsive UI
- MySQL schema and sample events

## Requirements
- Node.js 18+
- MySQL 8+
- npm

## 1. Database setup
Create a MySQL database and tables by running `database/schema.sql` in MySQL Workbench or the MySQL command line.

## 2. Backend setup
```bash
cd backend
copy .env.example .env
npm install
```
Edit `.env` and set your MySQL username/password and a long JWT secret.

Start the API:
```bash
npm run dev
```
API runs at `http://localhost:5000`.

## 3. Frontend setup
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the URL shown by Vite (usually `http://localhost:5173`).

## Demo workflow
1. Register a new account.
2. Sign in.
3. Browse the sample events.
4. Book an event.
5. Open **My Bookings** to see your bookings.

## Notes
- New accounts receive the `user` role. For event-management endpoints, update a trusted account's role to `organizer` in MySQL:
  `UPDATE users SET role='organizer' WHERE email='your-email@example.com';`
- This is an educational starter project. Before public deployment, add production-grade validation, rate limiting, email verification, password reset, logging, tests, and secure secret management.
