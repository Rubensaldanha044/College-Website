const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register (admin creates users)
router.post('/register', async (req,res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.json({ message: 'User created', user: { id: user._id, email: user.email, role: user.role }});
  } catch (err) { res.status(400).json({ error: err.message }); }
});

// Login
router.post('/login', async (req,res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const match = await user.matchPassword(password);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role }});
});




module.exports = router;