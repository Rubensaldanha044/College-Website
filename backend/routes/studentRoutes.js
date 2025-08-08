const express = require('express');
const router = express.Router();
const Student = require('../models/Student');
const { protect, authorize } = require('../middleware/auth');

// Create student (admin)
router.post('/', protect, authorize('admin'), async (req,res) => {
  try {
    const s = new Student(req.body);
    await s.save();
    res.json(s);
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Read all
router.get('/', protect, authorize('admin','faculty'), async (req,res) => {
  const list = await Student.find();
  res.json(list);
});

// Read one
router.get('/:id', protect, async (req,res) => {
  const s = await Student.findById(req.params.id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  res.json(s);
});

// Update
router.put('/:id', protect, authorize('admin'), async (req,res) => {
  const s = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(s);
});

// Delete
router.delete('/:id', protect, authorize('admin'), async (req,res) => {
  await Student.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});

module.exports = router;