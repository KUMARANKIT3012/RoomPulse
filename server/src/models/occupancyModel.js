import { query } from '../config/db.js';

export async function findLatestByRoom() {
  const { rows } = await query(`
    SELECT DISTINCT ON (r.id) r.id AS room_id, r.name, r.capacity,
      COALESCE(o.people_count, 0)::int AS people_count,
      (COALESCE(o.people_count, 0) > 0) AS is_occupied,
      COALESCE(o.recorded_at, NOW()) AS recorded_at,
      COALESCE(o.recorded_at, NOW()) AS timestamp
    FROM rooms r LEFT JOIN occupancy o ON o.room_id = r.id
    ORDER BY r.id, o.recorded_at DESC NULLS LAST`);
  return rows;
}

export async function create({ roomId, peopleCount, source }) {
  const { rows } = await query(
    `INSERT INTO occupancy(room_id, people_count, source) VALUES($1,$2,$3)
     RETURNING id, room_id, people_count, source, recorded_at`,
    [roomId, peopleCount, source]);
  return rows[0];
}

export async function findHistory({ roomId, limit = 30 }) {
  const params = [];
  const conditions = [];
  if (roomId) {
    params.push(roomId);
    conditions.push(`o.room_id = $${params.length}`);
  }
  params.push(Math.min(Math.max(Number(limit) || 30, 1), 100));
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query(`SELECT o.id, o.room_id, r.name AS room_name,
      o.people_count, o.people_count > 0 AS is_occupied, o.source,
      o.recorded_at, o.recorded_at AS timestamp
    FROM occupancy o JOIN rooms r ON r.id = o.room_id
    ${where} ORDER BY o.recorded_at DESC LIMIT $${params.length}`, params);
  return rows;
}
