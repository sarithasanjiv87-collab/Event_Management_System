const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8) {
      return res.status(400).json({ message: 'Enter name, email, and a password with at least 8 characters.' });
    }
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ message: 'Email is already registered.' });
    const hash = await bcrypt.hash(password, 12);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
      [name.trim(), email.trim().toLowerCase(), hash]
    );
    res.status(201).json({ message: 'Account created.', userId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create account.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await db.query('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', [(email || '').toLowerCase()]);
    if (!rows.length || !(await bcrypt.compare(password || '', rows[0].password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const user = rows[0];
    const token = jwt.sign({ id: user.id, name: user.name, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not sign in.' });
  }
});

module.exports = router;
