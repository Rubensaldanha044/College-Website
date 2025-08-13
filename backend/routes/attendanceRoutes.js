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

// ✅ Mark bulk attendance (faculty use)
router.post('/mark-bulk', protect, async (req, res) => {
  try {
    const { date, records } = req.body;
    if (!date || !records || !Array.isArray(records)) {
      return res.status(400).json({ message: 'Date and records[] are required' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const attendanceRecords = [];

    for (const r of records) {
      const existing = await Attendance.findOne({
        student: r.studentId,
        date: attendanceDate
      });
      if (!existing) {
        attendanceRecords.push({
          student: r.studentId,
          course: r.course || '',
          date: attendanceDate,
          status: r.status
        });
      }
    }
    router.get('/students/class/:className', protect, async (req, res) => {
  const students = await User.find({ role: 'student', class: req.params.className })
    .select('name _id class rollNumber');
  res.json(students);
});


    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
    }

    res.json({ message: 'Attendance marked successfully' });
  } catch (error) {
    res.status(500).json({ message: `Error marking attendance: ${error.message}` });
  }
});

// ✅ Mark single attendance (direct form submission)
router.post('/', protect, async (req, res) => {
  try {
    const { studentId, course, date, status } = req.body;
    if (!studentId || !date || !status) {
      return res.status(400).json({ message: 'StudentId, date, and status are required' });
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(0, 0, 0, 0);

    const existing = await Attendance.findOne({ student: studentId, date: attendanceDate });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for this student on this date' });
    }

    const record = await Attendance.create({
      student: studentId,
      course: course || '',
      date: attendanceDate,
      status
    });

    res.json({ message: 'Attendance recorded successfully', record });
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

// ✅ Get attendance for a specific student
router.get('/student/:id', protect, async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.params.id })
      .populate('student', 'name class rollNumber');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: `Error fetching student attendance: ${error.message}` });
  }
});

module.exports = router;
