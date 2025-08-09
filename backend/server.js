require('dotenv').config({ path: './backend/.env' });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');

// Import models
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const courseRoutes = require('./routes/courseRoutes');
const facultyRoutes = require('./routes/facultyRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/attendance', attendanceRoutes);

// Function to create default admin if not exists
async function createDefaultAdmin() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@college.com' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Default Admin',
        email: 'admin@college.com',
        password: 'admin123',
        role: 'admin'
      });
      console.log('✅ Default admin created: admin@college.com / admin123');
    } else {
      console.log('ℹ️ Default admin already exists');
    }
  } catch (err) {
    console.error('Error creating default admin:', err);
  }
}

// Connect DB and start server
const PORT = process.env.PORT ||5000;
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('✅ MongoDB connected');
    await createDefaultAdmin(); // Create default admin here
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ DB connection error:', err.message);
  });

// Serve frontend (optional)
app.use(express.static(path.join(__dirname, '..', 'frontend')));

