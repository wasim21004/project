const db = require('../db'); // pg pool or ORM
const calendarService = require('../services/calendarService');

exports.create = async (req, res) => {
  const userId = req.user.id;
  const { title, description, priority, scheduled, scheduledAt, syncToCalendar } = req.body;

  const result = await db.query(
    `INSERT INTO tasks (user_id, title, description, priority, scheduled, scheduled_at)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [userId, title, description, priority, scheduled, scheduledAt || null]
  );

  const task = result.rows[0];

  if (syncToCalendar && scheduled && scheduledAt) {
    try {
      const event = await calendarService.createEventForUser(userId, task);
      await db.query(`UPDATE tasks SET google_event_id=$1 WHERE id=$2`, [event.id, task.id]);
      task.google_event_id = event.id;
    } catch (err) {
      console.error('Calendar sync failed', err);
    }
  }
  res.status(201).json({ task });
};
