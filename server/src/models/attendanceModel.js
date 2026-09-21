import { query } from '../config/db.js';

export async function findReport(scheduleId) {
  const { rows } = await query(`
    SELECT s.id AS schedule_id, s.course_code, s.title, s.room_id,
      COUNT(e.student_id)::int AS expected,
      COUNT(a.student_id)::int AS present,
      (COUNT(e.student_id) - COUNT(a.student_id))::int AS absent,
      COALESCE(json_agg(json_build_object(
        'id', st.id, 'student_number', st.student_number, 'name', st.name,
        'present', a.student_id IS NOT NULL, 'scanned_at', a.scanned_at
      ) ORDER BY st.name) FILTER (WHERE st.id IS NOT NULL), '[]') AS students
    FROM schedules s
    LEFT JOIN class_enrollments e ON e.schedule_id = s.id
    LEFT JOIN students st ON st.id = e.student_id AND st.active = TRUE
    LEFT JOIN attendance_scans a ON a.schedule_id = s.id AND a.student_id = st.id
    WHERE s.id = $1
    GROUP BY s.id`, [scheduleId]);
  return rows[0];
}

export async function recordScan({ scheduleId, cardUid, deviceId = 'RFID-reader' }) {
  const { rows } = await query(`
    INSERT INTO attendance_scans(schedule_id, student_id, device_id)
    SELECT $1, st.id, $3 FROM students st
    JOIN class_enrollments e ON e.student_id = st.id AND e.schedule_id = $1
    WHERE st.card_uid = $2 AND st.active = TRUE
    ON CONFLICT (schedule_id, student_id) DO UPDATE SET scanned_at = NOW(), device_id = EXCLUDED.device_id
    RETURNING id, schedule_id, student_id, device_id, scanned_at`, [scheduleId, cardUid, deviceId]);
  if (!rows[0]) return null;
  const { rows: studentRows } = await query(
    'SELECT student_number, name FROM students WHERE id = $1', [rows[0].student_id]);
  return { ...rows[0], student: studentRows[0] };
}