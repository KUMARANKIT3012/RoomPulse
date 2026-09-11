import { query } from '../config/db.js';

export async function findAll() {
  const { rows } = await query(`SELECT s.*, r.name AS room_name FROM schedules s
    JOIN rooms r ON r.id = s.room_id ORDER BY s.start_time`);
  return rows;
}

export async function hasOverlap(roomId, startTime, endTime) {
  const result = await query(`SELECT id FROM schedules WHERE room_id = $1
    AND start_time < $3 AND end_time > $2 LIMIT 1`, [roomId, startTime, endTime]);
  return result.rowCount > 0;
}

export async function create({ roomId, courseCode, title, instructor, startTime, endTime, attendees }) {
  const { rows } = await query(`INSERT INTO schedules
    (room_id,course_code,title,instructor,start_time,end_time,attendees)
    VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [roomId, courseCode, title, instructor, startTime, endTime, attendees]);
  return rows[0];
}
