CREATE TABLE IF NOT EXISTS admins (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  building TEXT NOT NULL,
  floor INTEGER NOT NULL DEFAULT 1,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  equipment TEXT[] NOT NULL DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS occupancy (
  id BIGSERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  people_count INTEGER NOT NULL CHECK (people_count >= 0),
  source TEXT NOT NULL DEFAULT 'ESP32/PIR',
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS occupancy_room_time_idx ON occupancy(room_id, recorded_at DESC);

CREATE TABLE IF NOT EXISTS schedules (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  course_code TEXT NOT NULL,
  title TEXT NOT NULL,
  instructor TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  attendees INTEGER NOT NULL CHECK (attendees > 0),
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS schedules_time_idx ON schedules(start_time, end_time);

CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL,
  booked_by TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  attendees INTEGER NOT NULL CHECK (attendees > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_time > start_time)
);

CREATE INDEX IF NOT EXISTS bookings_time_idx ON bookings(room_id, start_time, end_time);
