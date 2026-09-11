import { getRoomsWithLatestOccupancy } from '../services/classroomService.js';

export async function listRooms(req, res, next) {
  try { res.json(await getRoomsWithLatestOccupancy()); } catch (error) { next(error); }
}
