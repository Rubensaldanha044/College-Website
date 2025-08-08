const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  courseCode: String,
  date: String,
  present: [String] // array of studentIds or emails
}, { timestamps: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
