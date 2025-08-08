const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('admin'), async (req,res)=>{ const f = new Faculty(req.body); await f.save(); res.json(f); });
router.get('/', protect, authorize('admin','faculty'), async (req,res)=>{ const list = await Faculty.find(); res.json(list); });
router.put('/:id', protect, authorize('admin'), async (req,res)=>{ const f = await Faculty.findByIdAndUpdate(req.params.id, req.body, {new:true}); res.json(f); });
router.delete('/:id', protect, authorize('admin'), async (req,res)=>{ await Faculty.findByIdAndDelete(req.params.id); res.json({message:'Deleted'}); });

module.exports = router;