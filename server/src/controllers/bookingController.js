import { allocateRoom } from '../services/classroomService.js';
import * as bookingModel from '../models/bookingModel.js';
import { findById } from '../models/roomModel.js';

export async function listBookings(req, res, next) {
  try {
    res.json(await bookingModel.findAll());
  } catch (error) { next(error); }
}

export async function createBooking(req, res, next) {
  try {
    const { roomId, purpose, bookedBy, startTime, endTime, attendees, capacity } = req.body;
    const start = new Date(startTime); const end = new Date(endTime);
    if (!purpose || !bookedBy || !startTime || !endTime ||
      !Number.isInteger(Number(attendees)) || Number(attendees) < 1 ||
      Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end <= start) {
      return res.status(400).json({ error: 'Valid booking details are required' });
    }
    let room;
    if (roomId) {
      room = await findById(roomId);
      if (!room) return res.status(404).json({ error: 'Room not found' });
      if (room.capacity < Number(attendees)) return res.status(400).json({ error: 'Room capacity is too small' });
      if (await bookingModel.hasOverlap(roomId, startTime, endTime)) {
        return res.status(409).json({ error: 'Room is already booked for this interval' });
      }
    } else {
      room = await allocateRoom({
        capacity: Math.max(Number(capacity) || 0, Number(attendees)),
        startTime, endTime
      });
      if (!room) return res.status(409).json({ error: 'No suitable free classroom found' });
    }
    const booking = await bookingModel.create(
      { roomId: room.id, purpose, bookedBy, startTime, endTime, attendees });
    res.status(201).json({ ...booking, room_name: room.name });
  } catch (error) { next(error); }
}
