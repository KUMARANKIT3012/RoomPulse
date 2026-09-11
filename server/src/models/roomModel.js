import { query } from '../config/db.js';

export async function findAllWithLatestOccupancy() {
  const { rows } = await query(`
    SELECT r.*, COALESCE(o.people_count, 0)::int AS people_count,
      (COALESCE(o.people_count, 0) > 0) AS is_occupied,
      CASE WHEN COALESCE(o.people_count, 0) > 0 THEN 'occupied' ELSE 'free' END AS status,
      COALESCE(o.recorded_at, NOW()) AS recorded_at
    FROM rooms r
    LEFT JOIN LATERAL (SELECT people_count, recorded_at FROM occupancy
      WHERE room_id = r.id ORDER BY recorded_at DESC LIMIT 1) o ON TRUE
    ORDER BY r.capacity, r.id`);
  return rows;
}

export async function findById(id) {
  const { rows } = await query('SELECT * FROM rooms WHERE id = $1', [id]);
  return rows[0];
}

export async function findAll() {
  const { rows } = await query('SELECT * FROM rooms ORDER BY capacity, id');
  return rows;
}
