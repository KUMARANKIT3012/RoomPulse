import { findLatestByRoom, findHistory, create } from '../models/occupancyModel.js';
import { findById } from '../models/roomModel.js';

export async function listOccupancy(req, res, next) {
  try {
    res.json(await findLatestByRoom());
  } catch (error) { next(error); }
}

export async function listOccupancyHistory(req, res, next) {
  try {
    res.json(await findHistory({ roomId: req.query.roomId, limit: req.query.limit }));
  } catch (error) { next(error); }
}

export async function updateOccupancy(req, res, next) {
  try {
    const { roomId, peopleCount, isOccupied, source = 'ESP32/PIR' } = req.body;
    const normalizedPeopleCount = peopleCount === undefined
      ? (isOccupied === true ? 1 : isOccupied === false ? 0 : NaN)
      : Number(peopleCount);
    if (!Number.isInteger(Number(roomId)) || !Number.isInteger(normalizedPeopleCount) || normalizedPeopleCount < 0) {
      return res.status(400).json({ error: 'roomId and either peopleCount or isOccupied are required' });
    }
    if (!await findById(roomId)) return res.status(404).json({ error: 'Room not found' });
    res.status(201).json(await create({ roomId, peopleCount: normalizedPeopleCount, source }));
  } catch (error) { next(error); }
}
