# RoomPulse

RoomPulse is a smart classroom operations dashboard for monitoring live room occupancy, planning events, and allocating campus spaces efficiently. The project mixes a React dashboard with an Express + PostgreSQL backend and includes practical Design and Analysis of Algorithms (DAA) logic for room selection and scheduling checks.

## Why this project exists

This app was designed to solve a common campus problem: deciding which classroom is available, how full it is, and whether an event can be scheduled without conflict. It combines live occupancy information, room metadata, booking validation, and algorithmic room assignment into one dashboard.

## Main features

- Live classroom occupancy monitoring using simulated sensor-style readings
- Quick room view with building, floor, capacity, and equipment details
- Smallest-fit room selection when no room is chosen during event planning
- Conflict checking for overlapping bookings and schedules
- Recent notification and activity feed for room events
- JWT-protected admin login and booking access
- Light and dark mode interface
- DAA-driven room allocation and scheduling logic

## Tech stack

- Frontend: React, Vite, Tailwind CSS, Lucide React
- Backend: Node.js, Express, PostgreSQL, JWT, bcryptjs
- Architecture: client + server with REST API and PostgreSQL persistence

## Project structure

```text
.
├── client/                  # React + Vite frontend
├── server/                  # Express API and database scripts
│   ├── sql/
│   │   └── schema.sql       # Database schema and indexes
│   └── src/
│       ├── config/          # Database configuration
│       ├── controllers/     # Request handlers
│       ├── middleware/      # Auth middleware
│       ├── models/          # SQL access helpers (if used by the app)
│       ├── routes/          # API routing
│       ├── services/        # DAA algorithms and classroom logic
│       ├── app.js           # Express app setup
│       ├── seed.js          # Demo data seeding
│       └── server.js        # Server entry point
├── package.json             # Root scripts for full-project tasks
├── README.md
└── .gitignore
```

## Requirements

- Node.js 18+
- npm
- PostgreSQL 14+
- Git

## Quick start

### 1. Install dependencies

From the project root:

```bash
npm run install:all
```

### 2. Configure the backend environment

Create the environment file from the example:

```bash
Copy-Item server/.env.example server/.env
```

Then make sure the values match your local PostgreSQL setup:

```env
PORT=4000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/smart_classroom
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
```

### 3. Create the database and seed the demo data

Create the `smart_classroom` database in PostgreSQL, then run:

```bash
psql "$env:DATABASE_URL" -f server/sql/schema.sql
npm run seed
```

If the database already exists and you want a clean reset, run the schema again before seeding.

### 4. Start the app

Run the whole project from the root:

```bash
npm run dev
```

This starts both the server and the client together.

If you want to run them separately:

```bash
# Terminal 1
npm run dev:server

# Terminal 2
npm run dev:client
```

Open the client in your browser at:

- http://localhost:5173

The API is available at:

- http://localhost:4000/api

## Demo login

The seeded development account is:

```text
Email: admin@campus.local
Password: admin123
```

Use this only for local development. Replace or remove it before production deployment.

## How the app works

1. The overview page shows live room usage, available classrooms, and utilization metrics.
2. The room scout tab lets you inspect occupancy, room capacity, and equipment.
3. The event planner accepts attendee count and requested time range, then selects an appropriate room automatically.
4. The activity view tracks recent sensor readings and occupancy changes.
5. The header supports theme switching and browsing recent room notifications.

## Important API routes

Base URL: `http://localhost:4000/api`

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/auth/login` | No | Admin login |
| GET | `/rooms` | No | List rooms and latest occupancy |
| GET | `/occupancy` | No | Latest reading for each room |
| GET | `/occupancy/history` | No | Occupancy history |
| POST | `/occupancy` | No | Add sensor reading |
| GET | `/schedules` | No | List schedules |
| POST | `/schedules` | JWT | Add schedule |
| GET | `/bookings` | JWT | View bookings |
| POST | `/bookings` | JWT | Create booking with conflict checks |
| GET | `/reports/utilization` | JWT | Get utilization analytics |

Health check:

```bash
curl http://localhost:4000/api/health
```

## DAA concepts used

The scheduling and allocation logic lives in the server service layer and demonstrates several algorithmic ideas:

- Greedy allocation: picks the smallest suitable room that can fit the attendees
- Activity selection: resolves compatible time windows without overlap
- Binary search: helps with lower-bound checks on sorted room and scheduling data
- Interval conflict detection: rejects bookings that overlap in the same room

## Useful commands

From the project root:

| Command | Description |
| --- | --- |
| `npm run install:all` | Install all dependencies |
| `npm run dev` | Start both client and server |
| `npm run dev:server` | Start the API only |
| `npm run dev:client` | Start the frontend only |
| `npm run build` | Build the frontend for production |
| `npm run start` | Start the API in production mode |
| `npm run seed` | Seed demo data into PostgreSQL |

## Troubleshooting

### Port 4000 is already in use

Check whether there is already an API instance running:

```bash
curl http://localhost:4000/api/health
```

If needed, stop the old process and restart the server.

### Login returns failed to fetch

Verify that the backend is running and that the frontend is pointing to the correct API origin.

### No rooms appear in the dashboard

Run the schema and seed again:

```bash
psql "$env:DATABASE_URL" -f server/sql/schema.sql
npm run seed
```

## License

This project is intended for educational and demonstration use.
