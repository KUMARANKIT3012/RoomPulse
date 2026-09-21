import { findReport, recordScan } from '../models/attendanceModel.js';

export async function getAttendanceReport(req, res, next) {
  try {
    const scheduleId = Number(req.query.scheduleId);
    if (!Number.isInteger(scheduleId)) return res.status(400).json({ error: 'scheduleId is required' });
    const report = await findReport(scheduleId);
    if (!report) return res.status(404).json({ error: 'Class schedule not found' });
    res.json(report);
  } catch (error) { next(error); }
}

export async function scanAttendance(req, res, next) {
  try {
    const scheduleId = Number(req.body.scheduleId);
    const { cardUid, deviceId } = req.body;
    if (!Number.isInteger(scheduleId) || !cardUid) {
      return res.status(400).json({ error: 'scheduleId and cardUid are required' });
    }
    const scan = await recordScan({ scheduleId, cardUid: String(cardUid).trim(), deviceId });
    if (!scan) return res.status(404).json({ error: 'Card is not enrolled in this class' });
    res.status(201).json(scan);
  } catch (error) { next(error); }
}