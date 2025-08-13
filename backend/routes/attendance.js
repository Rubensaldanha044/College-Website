const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// ✅ Get students by class
router.get('/students/class/:className', protect, async (req, res) => {
  try {
    const students = await User.find({ role: 'student', class: req.params.className })
      .select('name _id class rollNumber');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: `Error fetching students: ${error.message}` });
  }
});

// ✅ Mark bulk attendance (API use, e.g., via AJAX)
router.post('/mark-bulk', protect, async (req, res) => {
  try {
    const { date, records } = req.body;

    if (!date || !records || !Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ message: 'Date and records[] are required' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    // Remove duplicates from incoming data
    const uniqueRecords = [...new Map(records.map(r => [r.studentId, r])).values()];

    // Prevent duplicate entries in DB
    for (const r of uniqueRecords) {
      const existing = await Attendance.findOne({
        student: r.studentId,
        date: attendanceDate
      });
      if (existing) {
        return res.status(400).json({ message: `Attendance already marked for ${r.studentId}` });
      }
    }

    const attendanceRecords = uniqueRecords.map(r => ({
      student: r.studentId,
      date: attendanceDate,
      status: r.status
    }));

    await Attendance.insertMany(attendanceRecords);
    res.json({ message: '✅ Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: `Error marking attendance: ${error.message}` });
  }
});

// ✅ Mark attendance via faculty form (single request with present list)
router.post('/', protect, async (req, res) => {
  try {
    const { course, date, present } = req.body;

    if (!course || !date || !present || !Array.isArray(present) || present.length === 0) {
      return res.status(400).json({ message: 'Course, date, and present[] are required' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendanceRecords = present.map(studentId => ({
      student: studentId,
      course,
      date: attendanceDate,
      status: 'present'
    }));

    await Attendance.insertMany(attendanceRecords);
    res.json({ message: '✅ Attendance recorded successfully' });
  } catch (error) {
    res.status(500).json({ message: `Error saving attendance: ${error.message}` });
  }
});

// ✅ View attendance by date
router.get('/date/:date', protect, async (req, res) => {
  try {
    const date = new Date(req.params.date);
    date.setHours(0, 0, 0, 0);
    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const records = await Attendance.find({
      date: { $gte: date, $lt: nextDate }
    }).populate('student', 'name class rollNumber');

    res.json(records);
  } catch (error) {
    res.status(500).json({ message: `Error fetching attendance: ${error.message}` });
  }
});

module.exports = router;
