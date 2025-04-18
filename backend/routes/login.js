import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { username, password } = req.body;

  try {
    const admin = await Admin.findOne({ username });

    if (!admin) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    // eslint-disable-next-line no-undef
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '10m' });
    res.json({ token });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
