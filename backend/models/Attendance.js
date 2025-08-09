const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Present', 'Absent'],
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', attendanceSchema);

/**
 * ✅ Get All Students in a Class
 * GET /api/students/class/:className
 */
router.get('/students/class/:className', requireFacultyOrAdmin, async (req, res) => {
  try {
    const { className } = req.params;
    const students = await User.find({ role: 'student', class: className }).select('name _id class rollNumber');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


