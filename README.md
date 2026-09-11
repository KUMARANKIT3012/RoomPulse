# RoomPulse

RoomPulse is a smart classroom operations dashboard for monitoring live room occupancy, planning events, allocating classrooms, and tracking campus utilization.

It combines a React dashboard with an Express and PostgreSQL API. The project also demonstrates practical Design and Analysis of Algorithms (DAA) concepts through room allocation, interval scheduling, and binary search.

## What It Does

- Shows live classroom occupancy from ESP32/PIR-style sensor readings.
- Highlights room capacity, availability, equipment, and building location.
- Selects the smallest suitable room for an event when no room is specified.
- Prevents overlapping bookings for the same room.
- Displays schedules, booking activity, sensor history, and utilization reports.
- Provides JWT-protected admin access.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React
- **Backend:** Node.js, Express, JWT, bcryptjs
- **Database:** PostgreSQL
- **Architecture:** PERN-style client and REST API

## Project Structure

```text
.
├── client/                 # React and Vite dashboard
├── server/                 # Express REST API
│   ├── sql/schema.sql      # PostgreSQL tables and indexes
│   └── src/
│       ├── controllers/    # HTTP request handlers
│       ├── models/         # Database queries
│       ├── routes/         # API routes
│       └── services/       # Room allocation and DAA algorithms
├── package.json
└── README.md
```

## Requirements

- Node.js 18 or newer
- npm
- PostgreSQL 14 or newer
- Git

## Local Setup

### 1. Install dependencies

From the project root:

```powershell
npm run install:all
```

### 2. Configure the API

Create `server/.env` from `server/.env.example`:

```powershell
Copy-Item server/.env.example server/.env
```

Update the values if your PostgreSQL configuration is different:

```env
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/smart_classroom
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
```

Create the `smart_classroom` database, then apply the schema and sample data:

```powershell
psql "$env:DATABASE_URL" -f server/sql/schema.sql
npm run seed --prefix server
```

### 3. Start the application

The easiest option is to run both applications from the project root:

```powershell
npm run dev
```

Or start them separately in two terminals:

```powershell
# Terminal 1
cd server
npm run server

# Terminal 2
cd client
npm run dev
```

Open the dashboard at [http://localhost:5173](http://localhost:5173).

If Vite automatically selects another port, open the URL printed in the terminal. The API accepts local Vite ports during development.

## Demo Login

The seed script creates this local development administrator:

```text
Email:    admin@campus.local
Password: admin123
```

Change or remove this demo credential before deploying the application.

## Available Commands

Run these commands from the project root unless noted otherwise:

| Command | Description |
| --- | --- |
| `npm run install:all` | Install client and server dependencies |
| `npm run dev` | Start the client and API together |
| `npm run start` | Start the API in production mode |
| `npm run build --prefix client` | Build the frontend for production |
| `npm run seed --prefix server` | Seed the database with demo data |
| `npm run dev --prefix server` | Start the API with Node watch mode |
| `npm run dev --prefix client` | Start the Vite dashboard |

## API Overview

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `POST` | `/auth/login` | No | Authenticate an administrator |
| `GET` | `/rooms` | No | List rooms with latest occupancy |
| `GET` | `/occupancy` | No | Get the latest reading for each room |
| `GET` | `/occupancy/history` | No | Get occupancy history |
| `POST` | `/occupancy` | No | Add a sensor occupancy reading |
| `GET` | `/schedules` | No | List scheduled classes |
| `POST` | `/schedules` | JWT | Create a schedule |
| `GET` | `/bookings` | JWT | List bookings |
| `POST` | `/bookings` | JWT | Create a conflict-checked booking |
| `GET` | `/reports/utilization` | JWT | Get room utilization metrics |

Health check:

```text
GET http://localhost:4000/api/health
```

## DAA Concepts Used

The algorithm implementations are in `server/src/services/algorithms.js` and are used by `server/src/services/classroomService.js`.

- **Greedy allocation:** chooses the smallest available room that can fit the requested number of attendees.
- **Activity selection:** works with finish times to select a conflict-free set of intervals.
- **Binary search:** finds lower bounds in sorted room-capacity and timetable data.
- **Interval conflict detection:** rejects overlapping bookings for a room and time range.

## Troubleshooting

### Port 4000 is already in use

Another API process is already running. Check it first:

```powershell
Invoke-RestMethod http://localhost:4000/api/health
```

If it is the old process, stop it and restart the API:

```powershell
$listener = Get-NetTCPConnection -LocalPort 4000 -State Listen
Stop-Process -Id $listener.OwningProcess -Force
cd server
npm run server
```

### Login says `Failed to fetch`

Make sure the API is running and that the dashboard is using the URL printed by Vite. During local development, the API allows `localhost` Vite ports.

### Dashboard shows no rooms

Run the schema and seed commands again, then refresh the dashboard:

```powershell
psql "$env:DATABASE_URL" -f server/sql/schema.sql
npm run seed --prefix server
```

## License

This project is intended for educational and demonstration use.
