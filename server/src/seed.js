import bcrypt from 'bcryptjs';
import { pool, query } from './config/db.js';

const rooms = [
  ['A-101', 'Engineering Block', 1, 30, ['Projector', 'Whiteboard']],
  ['A-202', 'Engineering Block', 2, 60, ['Projector', 'Video conference']],
  ['B-110', 'Science Block', 1, 45, ['Smart board', 'Lab benches']],
  ['C-301', 'Library Block', 3, 120, ['Projector', 'Audio system', 'Accessible']],
  ['D-105', 'Innovation Hub', 1, 24, ['Interactive display', 'Whiteboard']]
];

try {
  await query(`INSERT INTO admins(name,email,password_hash) VALUES($1,$2,$3)
    ON CONFLICT(email) DO UPDATE SET password_hash=EXCLUDED.password_hash`, [
    'Campus Administrator', 'admin@campus.local', await bcrypt.hash('admin123', 10)]);
  for (const room of rooms) await query(`INSERT INTO rooms(name,building,floor,capacity,equipment)
    VALUES($1,$2,$3,$4,$5) ON CONFLICT(name) DO NOTHING`, room);
  const { rows } = await query('SELECT id FROM rooms ORDER BY id');
  for (const room of rows) {
    await query(`INSERT INTO occupancy(room_id,people_count,source)
      SELECT $1,$2,'seed' WHERE NOT EXISTS
      (SELECT 1 FROM occupancy WHERE room_id=$1)`, [room.id, Math.floor(Math.random() * 20)]);
  }
  await query(`INSERT INTO schedules(room_id,course_code,title,instructor,start_time,end_time,attendees)
    SELECT id,'CS301','Design and Analysis of Algorithms','Dr. Mehta',
      CURRENT_DATE + INTERVAL '9 hours', CURRENT_DATE + INTERVAL '10 hours',25
    FROM rooms WHERE name='A-101' AND NOT EXISTS (SELECT 1 FROM schedules)`);
  await query(`INSERT INTO schedules(room_id,course_code,title,instructor,start_time,end_time,attendees)
    SELECT id,'PHY210','Applied Physics','Dr. Rao',
      CURRENT_DATE + INTERVAL '10 hours', CURRENT_DATE + INTERVAL '11 hours',38
    FROM rooms WHERE name='B-110' AND NOT EXISTS (SELECT 1 FROM schedules WHERE course_code='PHY210')`);
  const { rows: schedules } = await query('SELECT id, course_code, attendees FROM schedules');
  for (const schedule of schedules) {
    for (let index = 1; index <= schedule.attendees; index += 1) {
      const studentNumber = `${schedule.course_code}-${String(index).padStart(3, '0')}`;
      const { rows: students } = await query(`INSERT INTO students(student_number, name, card_uid)
        VALUES($1,$2,$3) ON CONFLICT(student_number) DO UPDATE SET name=EXCLUDED.name, card_uid=EXCLUDED.card_uid
        RETURNING id`, [studentNumber, `Student ${String(index).padStart(3, '0')}`, `CARD-${studentNumber}`]);
      await query(`INSERT INTO class_enrollments(schedule_id, student_id) VALUES($1,$2)
        ON CONFLICT DO NOTHING`, [schedule.id, students[0].id]);
    }
  }
  await query(`INSERT INTO bookings(room_id,purpose,booked_by,start_time,end_time,attendees)
    SELECT id,'Robotics club workshop','Student Activities',
      CURRENT_DATE + INTERVAL '1 day' + INTERVAL '14 hours',
      CURRENT_DATE + INTERVAL '1 day' + INTERVAL '16 hours',28
    FROM rooms WHERE name='A-101' AND NOT EXISTS (SELECT 1 FROM bookings)`);
  await query(`INSERT INTO bookings(room_id,purpose,booked_by,start_time,end_time,attendees)
    SELECT id,'Faculty planning','Academic Office',
      CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10 hours',
      CURRENT_DATE + INTERVAL '1 day' + INTERVAL '11 hours',12
    FROM rooms WHERE name='A-202' AND NOT EXISTS (SELECT 1 FROM bookings WHERE purpose='Faculty planning')`);
  console.log('Database seeded');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally { await pool.end(); }
