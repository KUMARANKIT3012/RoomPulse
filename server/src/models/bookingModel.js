import { query } from '../config/db.js';

export async function findAll() {
  const { rows } = await query(`SELECT b.*, r.name AS room_name FROM bookings b
    JOIN rooms r ON r.id = b.room_id ORDER BY b.start_time`);
  return rows;
}

export async function hasOverlap(roomId, startTime, endTime) {
  const result = await query(`SELECT id FROM bookings WHERE room_id=$1
    AND start_time < $3 AND end_time > $2 LIMIT 1`, [roomId, startTime, endTime]);
  return result.rowCount > 0;
}

export async function create({ roomId, purpose, bookedBy, startTime, endTime, attendees }) {
  const { rows } = await query(`INSERT INTO bookings
    (room_id,purpose,booked_by,start_time,end_time,attendees)
    VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [roomId, purpose, bookedBy, startTime, endTime, attendees]);
  return rows[0];
}
