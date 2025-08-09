const express = require('express');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const router = express.Router();

// Middleware to check role
function requireFacultyOrAdmin(req, res, next) {
  if (req.user.role === 'faculty' || req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Only faculty/admin can mark attendance' });
}

/**
 * ✅ BULK Mark Attendance
 * Body format:
 * {
 *   "date": "2025-08-09",
 *   "records": [
 *       { "studentId": "64d8b3e1c0a...", "status": "present" },
 *       { "studentId": "64d8b3e1c0b...", "status": "absent" }
 *   ]
 * }
 */
router.post('/mark-bulk', requireFacultyOrAdmin, async (req, res) => {
  try {
    const { date, records } = req.body;
    const attendanceDate = new Date(date || new Date().setHours(0,0,0,0));

    const results = [];

    for (const record of records) {
      const student = await User.findById(record.studentId);
      if (!student || student.role !== 'student') {
        results.push({ studentId: record.studentId, status: 'failed', reason: 'Invalid student' });
        continue;
      }

      const attendance = await Attendance.findOneAndUpdate(
        { student: record.studentId, date: attendanceDate },
        { status: record.status, markedBy: req.user._id, date: attendanceDate },
        { upsert: true, new: true }
      );

      results.push({ studentId: record.studentId, status: 'success', attendance });
    }

    res.json({ message: 'Bulk attendance processed', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ View Attendance for a Student
 */
router.get('/student/:id', async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.id })
      .populate('markedBy', 'name')
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * ✅ View Attendance for a Date
 */
router.get('/date/:date', async (req, res) => {
  try {
    const day = new Date(req.params.date);
    const records = await Attendance.find({ date: day })
      .populate('student', 'name')
      .populate('markedBy', 'name');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
