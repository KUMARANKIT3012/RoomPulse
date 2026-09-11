import { query } from '../config/db.js';

export async function utilization(req, res, next) {
  try {
    const roomRows = await query(`SELECT r.id, r.name, r.capacity,
      COALESCE(SUM(EXTRACT(EPOCH FROM (b.end_time-b.start_time))/3600),0) AS booked_hours,
      COALESCE(SUM(EXTRACT(EPOCH FROM (b.end_time-b.start_time))/3600 * b.attendees),0) AS person_hours
      FROM rooms r LEFT JOIN bookings b ON b.room_id=r.id
      GROUP BY r.id ORDER BY r.name`);
    const peakRows = await query(`SELECT EXTRACT(HOUR FROM start_time)::int AS hour,
      COUNT(*)::int AS classes, COALESCE(SUM(attendees),0)::int AS attendees
      FROM bookings GROUP BY hour ORDER BY hour`);
    const total = roomRows.rows.reduce((sum, r) => sum + Number(r.booked_hours), 0);
    res.json({
      rooms: roomRows.rows.map((r) => ({ ...r, booked_hours: Number(r.booked_hours),
        person_hours: Number(r.person_hours), usage_percent: Math.min(100, Number(r.booked_hours) / 8 * 100) })),
      peakHours: peakRows.rows,
      totalBookedHours: total
    });
  } catch (error) { next(error); }
}
