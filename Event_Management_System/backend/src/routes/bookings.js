const router = require('express').Router();
const db = require('../db');
const { auth } = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  try {
    const eventId = Number(req.body.event_id);
    const tickets = Math.max(1, Math.min(10, Number(req.body.tickets) || 1));
    const [events] = await db.query('SELECT id, capacity FROM events WHERE id=?', [eventId]);
    if (!events.length) return res.status(404).json({ message: 'Event not found.' });
    const [used] = await db.query("SELECT COALESCE(SUM(tickets),0) AS booked FROM bookings WHERE event_id=? AND status='confirmed'", [eventId]);
    if (used[0].booked + tickets > events[0].capacity) return res.status(400).json({ message: 'Not enough seats available.' });
    await db.query(
      "INSERT INTO bookings (user_id, event_id, tickets) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE tickets=VALUES(tickets), status='confirmed'",
      [req.user.id, eventId, tickets]
    );
    res.status(201).json({ message: 'Booking confirmed.' });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Could not create booking.' });
  }
});

router.get('/mine', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT b.id AS booking_id, b.tickets, b.status, b.booked_at, e.title, e.venue, e.event_date, e.price
       FROM bookings b JOIN events e ON e.id=b.event_id WHERE b.user_id=? ORDER BY b.booked_at DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Could not load bookings.' });
  }
});

router.patch('/:id/cancel', auth, async (req, res) => {
  try {
    const [result] = await db.query(
      "UPDATE bookings SET status='cancelled' WHERE id=? AND user_id=?",
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'Booking not found.' });
    res.json({ message: 'Booking cancelled.' });
  } catch (err) {
    console.error(err); res.status(500).json({ message: 'Could not cancel booking.' });
  }
});

module.exports = router;
