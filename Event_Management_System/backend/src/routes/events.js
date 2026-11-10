const router = require('express').Router();
const db = require('../db');
const { auth, organizerOnly } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM events ORDER BY event_date ASC');
    res.json(rows);
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Could not load events.' });
  }
});

router.post('/', auth, organizerOnly, async (req, res) => {
  try {
    const { title, description, category, venue, event_date, price, capacity, image_url } = req.body;
    if (!title || !venue || !event_date) return res.status(400).json({ message: 'Title, venue and date are required.' });
    const [result] = await db.query(
      `INSERT INTO events (title, description, category, venue, event_date, price, capacity, image_url, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description || '', category || 'General', venue, event_date, Number(price) || 0, Number(capacity) || 100, image_url || '', req.user.id]
    );
    res.status(201).json({ id: result.insertId, message: 'Event created.' });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Could not create event.' });
  }
});

router.put('/:id', auth, organizerOnly, async (req, res) => {
  try {
    const { title, description, category, venue, event_date, price, capacity, image_url } = req.body;
    const [result] = await db.query(
      `UPDATE events SET title=?, description=?, category=?, venue=?, event_date=?, price=?, capacity=?, image_url=?
       WHERE id=?`,
      [title, description || '', category || 'General', venue, event_date, Number(price) || 0, Number(capacity) || 100, image_url || '', req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event updated.' });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Could not update event.' });
  }
});

router.delete('/:id', auth, organizerOnly, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM events WHERE id=?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'Event not found.' });
    res.json({ message: 'Event deleted.' });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Could not delete event.' });
  }
});

module.exports = router;
