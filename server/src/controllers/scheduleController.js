import { findScheduleAtOrAfter, selectMaxNonConflictingActivities } from '../services/algorithms.js';
import * as scheduleModel from '../models/scheduleModel.js';
import { findById } from '../models/roomModel.js';

export async function listSchedules(req, res, next) {
  try {
    const rows = await scheduleModel.findAll();
    // Binary search is used for the optional fast lookup query parameter.
    let result = req.query.from ? rows.slice(findScheduleAtOrAfter(rows, req.query.from)) : rows;
    // Activity selection mode returns the maximum conflict-free timetable set.
    if (req.query.optimal === 'true') {
      const byRoom = new Map();
      for (const schedule of result) {
        if (!byRoom.has(schedule.room_id)) byRoom.set(schedule.room_id, []);
        byRoom.get(schedule.room_id).push(schedule);
      }
      result = [...byRoom.values()].flatMap(selectMaxNonConflictingActivities)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
    }
    res.json(result);
  } catch (error) { next(error); }
}

export async function createSchedule(req, res, next) {
  try {
    const { roomId, courseCode, title, instructor, startTime, endTime, attendees } = req.body;
    const start = new Date(startTime); const end = new Date(endTime);
    if (!roomId || !courseCode || !title || !instructor || !startTime || !endTime ||
      !Number.isInteger(Number(attendees)) || Number(attendees) < 1 ||
      Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ error: 'Valid class details are required' });
    }
    const room = await findById(roomId);
    if (!room) return res.status(404).json({ error: 'Room not found' });
    if (room.capacity < Number(attendees)) {
      return res.status(400).json({ error: 'Room capacity is too small' });
    }
    if (await scheduleModel.hasOverlap(roomId, startTime, endTime)) {
      return res.status(409).json({ error: 'Class overlaps an existing timetable interval' });
    }
    res.status(201).json(await scheduleModel.create(
      { roomId, courseCode, title, instructor, startTime, endTime, attendees }));
  } catch (error) { next(error); }
}
