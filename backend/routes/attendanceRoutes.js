const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('faculty'), async (req,res)=>{ const rec = new Attendance(req.body); await rec.save(); res.json(rec); });
router.get('/', protect, async (req,res)=>{ const list = await Attendance.find(); res.json(list); });

module.exports = router;