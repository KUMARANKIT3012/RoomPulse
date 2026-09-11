import { query } from '../config/db.js';
import { allocateSmallestSuitableRoom, selectMaxNonConflictingActivities } from './algorithms.js';
import { findAllWithLatestOccupancy } from '../models/roomModel.js';

export async function getRoomsWithLatestOccupancy() {
  return findAllWithLatestOccupancy();
}

export async function allocateRoom({ capacity, startTime, endTime }) {
  const rooms = (await query('SELECT * FROM rooms ORDER BY capacity, id')).rows;
  const bookings = (await query(
    `SELECT room_id, start_time, end_time FROM bookings
     WHERE start_time < $2 AND end_time > $1`, [startTime, endTime])).rows;
  return allocateSmallestSuitableRoom(rooms, bookings, Number(capacity),
    new Date(startTime), new Date(endTime));
}

export function validateAndSelectSchedule(schedules) {
  return selectMaxNonConflictingActivities(schedules);
}
